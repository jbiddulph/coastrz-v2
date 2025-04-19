export interface Product {
  id: string
  name: string
  description: string
  size?: string
  color?: string
  gender?: 'male' | 'female' | 'unisex'
  cost: number
  image_url?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  product_images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  is_primary: boolean
  created_at?: string
  updated_at?: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface ImageFile {
  file: File
  preview: string
  isPrimary: boolean
} 