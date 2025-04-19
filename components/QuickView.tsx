import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import ImageCarousel from './ImageCarousel';
import Link from 'next/link';
import { Product, ProductImage } from '@/types/types';

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  images: ProductImage[];
}

export default function QuickView({ isOpen, onClose, product, images }: QuickViewProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Added to cart');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="aspect-square relative">
                    <ImageCarousel 
                      images={images} 
                      mainImage={product.image_url}
                    />
                  </div>

                  <div>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-secondary mb-2 font-cooper-std">
                      {product.name}
                    </Dialog.Title>
                    <p className="text-2xl font-bold text-primary mb-4">£{product.cost.toFixed(2)}</p>
                    
                    <p className="text-secondary-light mb-6 line-clamp-3">
                      {product.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {product.size && (
                        <div>
                          <h4 className="text-sm font-medium text-secondary">Size</h4>
                          <p className="text-secondary-light">{product.size}</p>
                        </div>
                      )}
                      {product.color && (
                        <div>
                          <h4 className="text-sm font-medium text-secondary">Color</h4>
                          <p className="text-secondary-light">{product.color}</p>
                        </div>
                      )}
                      {product.gender && (
                        <div>
                          <h4 className="text-sm font-medium text-secondary">Gender</h4>
                          <p className="text-secondary-light capitalize">{product.gender}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-hover-primary transition-colors"
                      >
                        Add to Cart
                      </button>
                      <Link
                        href={`/product/${product.id}`}
                        className="flex-1 bg-neutral text-secondary px-4 py-2 rounded-lg hover:bg-bg-hover text-center"
                        onClick={onClose}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 