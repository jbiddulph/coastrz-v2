'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Image as FabricImage, Text as FabricText, IText, Circle, Triangle } from 'fabric';
import { toast } from 'react-hot-toast';
import { PhotoIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

interface DesignToolProps {
  onDesignUpdate?: (designData: string) => void;
}

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
];

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#00FFFF', label: 'Cyan' },
];

const SHAPES = [
  { value: 'rect', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
];

const SHAPE_COLORS = [
  { value: '#000000', label: 'Black', bgColor: 'bg-black' },
  { value: '#FFFFFF', label: 'White', bgColor: 'bg-white border border-gray-300' },
  { value: '#FF0000', label: 'Red', bgColor: 'bg-red-500' },
  { value: '#00FF00', label: 'Green', bgColor: 'bg-green-500' },
  { value: '#0000FF', label: 'Blue', bgColor: 'bg-blue-500' },
  { value: '#FFFF00', label: 'Yellow', bgColor: 'bg-yellow-500' },
  { value: '#FF00FF', label: 'Pink', bgColor: 'bg-pink-500' },
  { value: '#00FFFF', label: 'Cyan', bgColor: 'bg-cyan-500' },
  { value: '#FFA500', label: 'Orange', bgColor: 'bg-orange-500' },
  { value: '#800080', label: 'Purple', bgColor: 'bg-purple-500' },
];

export default function DesignTool({ onDesignUpdate }: DesignToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedFontWeight, setSelectedFontWeight] = useState('normal');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedShape, setSelectedShape] = useState('rect');
  const [selectedShapeColor, setSelectedShapeColor] = useState('#000000');
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas size to 500x500 pixels
      const canvasSize = 500;
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: canvasSize,
        height: canvasSize,
        backgroundColor: '#ffffff'
      });

      // Add the 9cm x 9cm dashed border (converting cm to pixels at 96 DPI)
      // 9cm = 3.54 inches = 340 pixels at 96 DPI
      const coasterSize = 340;
      const coasterLeft = (canvasSize - coasterSize) / 2;
      const coasterTop = (canvasSize - coasterSize) / 2;

      // Add bleed guide (350x350 pixels)
      const bleedSize = 350;
      const bleedLeft = (canvasSize - bleedSize) / 2;
      const bleedTop = (canvasSize - bleedSize) / 2;

      const bleedGuide = new Rect({
        left: bleedLeft,
        top: bleedTop,
        width: bleedSize,
        height: bleedSize,
        fill: 'transparent',
        stroke: '#ff0000',
        strokeWidth: 1,
        selectable: false,
        evented: false
      });

      const coasterBorder = new Rect({
        left: coasterLeft,
        top: coasterTop,
        width: coasterSize,
        height: coasterSize,
        fill: 'transparent',
        stroke: '#666666',
        strokeWidth: 2,
        strokeDashArray: [10, 5], // Creates dashed line
        rx: 25, // Corner radius
        ry: 25, // Corner radius
        selectable: false,
        evented: false
      });

      // Add size indicator text
      const sizeText = new FabricText('9cm x 9cm', {
        left: coasterLeft + coasterSize + 10,
        top: coasterTop,
        fontSize: 14,
        fill: '#666666',
        selectable: false,
        evented: false
      });

      // Add objects in the correct order (last added is on top)
      fabricCanvas.add(bleedGuide);
      fabricCanvas.add(coasterBorder);
      fabricCanvas.add(sizeText);
      fabricCanvas.renderAll();

      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    setLoading(true);
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        toast.error('Please sign in to upload images');
        router.push('/login');
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      console.log('Uploading file:', fileName);
      
      const { data, error } = await supabase.storage
        .from('designs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        if (error.message.includes('Bucket not found')) {
          toast.error('Storage bucket not configured. Please contact support.');
        } else {
          toast.error('Error uploading image: ' + error.message);
        }
        throw error;
      }

      console.log('File uploaded successfully:', data);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Notify parent component of the design image URL
      if (onDesignUpdate) {
        onDesignUpdate(publicUrl);
      }

      // Create a new image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('Image loaded successfully:', {
          width: img.width,
          height: img.height
        });
        
        // Create a new Fabric image from the loaded image
        const fabricImage = new FabricImage(img, {
          crossOrigin: 'anonymous'
        });
        
        // Scale image to fit within the coaster border (340x340 pixels)
        const coasterSize = 340;
        const scale = Math.min(coasterSize / img.width, coasterSize / img.height);
        fabricImage.scale(scale);

        // Center the image within the coaster border
        const canvasSize = 500;
        const coasterLeft = (canvasSize - coasterSize) / 2;
        const coasterTop = (canvasSize - coasterSize) / 2;
        fabricImage.set({
          left: coasterLeft + (coasterSize - img.width * scale) / 2,
          top: coasterTop + (coasterSize - img.height * scale) / 2
        });

        canvas.add(fabricImage);
        canvas.renderAll();
        console.log('Image added to canvas and rendered');
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        toast.error('Failed to load image into canvas');
      };

      // Set the source to load the image
      img.src = publicUrl;

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    
    // Re-add the borders and size indicator
    const canvasSize = 500;
    const coasterSize = 340;
    const coasterLeft = (canvasSize - coasterSize) / 2;
    const coasterTop = (canvasSize - coasterSize) / 2;

    // Add bleed guide
    const bleedSize = 350;
    const bleedLeft = (canvasSize - bleedSize) / 2;
    const bleedTop = (canvasSize - bleedSize) / 2;

    const bleedGuide = new Rect({
      left: bleedLeft,
      top: bleedTop,
      width: bleedSize,
      height: bleedSize,
      fill: 'transparent',
      stroke: '#ff0000',
      strokeWidth: 1,
      selectable: false,
      evented: false
    });

    const coasterBorder = new Rect({
      left: coasterLeft,
      top: coasterTop,
      width: coasterSize,
      height: coasterSize,
      fill: 'transparent',
      stroke: '#666666',
      strokeWidth: 2,
      strokeDashArray: [10, 5],
      rx: 25,
      ry: 25,
      selectable: false,
      evented: false
    });

    // Add size indicator text
    const sizeText = new FabricText('9cm x 9cm', {
      left: coasterLeft + coasterSize + 10,
      top: coasterTop,
      fontSize: 14,
      fill: '#666666',
      selectable: false,
      evented: false
    });

    // Add objects in the correct order (last added is on top)
    canvas.add(bleedGuide);
    canvas.add(coasterBorder);
    canvas.add(sizeText);
    canvas.renderAll();
  };

  const handleAddText = () => {
    if (!canvas) return;

    const text = new IText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: selectedFont,
      fontSize: selectedFontSize,
      fontWeight: selectedFontWeight,
      fill: selectedColor,
      padding: 10,
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    const objects = canvas.getObjects();
    canvas.remove(text);
    canvas.add(text); // Add back to the end
    canvas.renderAll();
  };

  const handleFontChange = (font: string) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontFamily', font);
      canvas.renderAll();
    }
    setSelectedFont(font);
  };

  const handleFontSizeChange = (size: number) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontSize', size);
      canvas.renderAll();
    }
    setSelectedFontSize(size);
  };

  const handleFontWeightChange = (weight: string) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontWeight', weight);
      canvas.renderAll();
    }
    setSelectedFontWeight(weight);
  };

  const handleColorChange = (color: string) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fill', color);
      canvas.renderAll();
    }
    setSelectedColor(color);
  };

  const handleBringForward = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      if (currentIndex < objects.length - 1) {
        // Swap with the object above
        const nextObject = objects[currentIndex + 1];
        canvas.remove(activeObject);
        canvas.remove(nextObject);
        canvas.add(nextObject);
        canvas.add(activeObject);
        canvas.setActiveObject(activeObject);
        canvas.renderAll();
      }
    }
  };

  const handleSendBack = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      if (currentIndex > 0) {
        // Swap with the object below
        const prevObject = objects[currentIndex - 1];
        canvas.remove(activeObject);
        canvas.remove(prevObject);
        canvas.add(activeObject);
        canvas.add(prevObject);
        canvas.setActiveObject(activeObject);
        canvas.renderAll();
      }
    }
  };

  const handleBringToFront = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      if (currentIndex < objects.length - 1) {
        canvas.remove(activeObject);
        canvas.add(activeObject);
        canvas.setActiveObject(activeObject);
        canvas.renderAll();
      }
    }
  };

  const handleSendToBack = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      if (currentIndex > 0) {
        canvas.remove(activeObject);
        const otherObjects = objects.filter(obj => obj !== activeObject);
        canvas.clear();
        canvas.add(activeObject);
        otherObjects.forEach(obj => canvas.add(obj));
        canvas.setActiveObject(activeObject);
        canvas.renderAll();
      }
    }
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const handleAddShape = () => {
    if (!canvas) return;

    const canvasSize = 500;
    const coasterSize = 340;
    const coasterLeft = (canvasSize - coasterSize) / 2;
    const coasterTop = (canvasSize - coasterSize) / 2;

    let shape;
    switch (selectedShape) {
      case 'rect':
        shape = new Rect({
          left: coasterLeft + 50,
          top: coasterTop + 50,
          width: 100,
          height: 100,
          fill: selectedShapeColor,
          stroke: '#000000',
          strokeWidth: 1,
          rx: 10,
          ry: 10,
        });
        break;
      case 'circle':
        shape = new Circle({
          left: coasterLeft + 50,
          top: coasterTop + 50,
          radius: 50,
          fill: selectedShapeColor,
          stroke: '#000000',
          strokeWidth: 1,
        });
        break;
      case 'triangle':
        shape = new Triangle({
          left: coasterLeft + 50,
          top: coasterTop + 50,
          width: 100,
          height: 100,
          fill: selectedShapeColor,
          stroke: '#000000',
          strokeWidth: 1,
        });
        break;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    }
  };

  const handleSaveDesign = async () => {
    if (!canvas) return;

    setSaving(true);
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        toast.error('Please sign in to save designs');
        router.push('/login');
        return;
      }

      // Convert canvas to image
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2 // Higher quality
      });

      // Convert base64 to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `${session.user.id}/${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from('designs')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png'
        });

      if (error) {
        console.error('Storage upload error:', error);
        if (error.message.includes('Bucket not found')) {
          toast.error('Storage bucket not configured. Please contact support.');
        } else {
          toast.error('Error saving design: ' + error.message);
        }
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(fileName);

      // Notify parent component of the design image URL
      if (onDesignUpdate) {
        onDesignUpdate(publicUrl);
        toast.success('Design saved successfully');
      } else {
        toast.error('Failed to update design URL');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas ref={canvasRef} className="rounded-lg" />
        {(loading || saving) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex-1 flex gap-2 text-sm">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={loading || saving}
            />
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-hover-primary transition-colors">
              <PhotoIcon className="h-5 w-5" />
              <span>Image</span>
            </div>
          </label>

          <button
            onClick={handleAddText}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover-primary transition-colors"
            disabled={saving}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Text</span>
          </button>

          <select
            value={selectedShape}
            onChange={(e) => setSelectedShape(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={saving}
          >
            {SHAPES.map((shape) => (
              <option key={shape.value} value={shape.value}>
                {shape.label}
              </option>
            ))}
          </select>

          <select
            value={selectedShapeColor}
            onChange={(e) => setSelectedShapeColor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={saving}
          >
            {SHAPE_COLORS.map((color) => (
              <option key={color.value} value={color.value} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${color.bgColor} rounded-sm`}></div>
                {color.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddShape}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover-primary transition-colors"
            disabled={saving}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Shape</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={handleBringToFront}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover-primary transition-colors"
            disabled={saving}
          >
            <ArrowUpIcon className="h-5 w-5" />
            <span>To Front</span>
          </button>

          <button
            onClick={handleBringForward}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover-primary transition-colors"
            disabled={saving}
          >
            <ArrowUpIcon className="h-5 w-5" />
            <span>Forward</span>
          </button>

          <button
            onClick={handleSendBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover-primary transition-colors"
            disabled={saving}
          >
            <ArrowDownIcon className="h-5 w-5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleSendToBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover-primary transition-colors"
            disabled={saving}
          >
            <ArrowDownIcon className="h-5 w-5" />
            <span>To Back</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={saving}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>

          <select
            value={selectedFontWeight}
            onChange={(e) => handleFontWeightChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={saving}
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>

          <select
            value={selectedFontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={saving}
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>

          <select
            value={selectedColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={saving}
          >
            {COLORS.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={handleDeleteSelected}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={saving}
          >
            <TrashIcon className="h-5 w-5" />
            <span>Delete</span>
          </button>

          <button
            onClick={handleClearCanvas}
            disabled={loading || saving}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleSaveDesign}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            disabled={saving}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Save Design</span>
          </button>
        </div>
      </div>
    </div>
  );
} 