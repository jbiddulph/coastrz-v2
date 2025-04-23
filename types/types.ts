export interface Product {
  id: string
  name: string
  description: string | null
  size: string | null
  color: string | null
  gender: string | null
  cost: number
  sale_cost: number | null
  image_url: string | null
  created_at: string
  updated_at: string
  user_id: string | null
  category_id: string | null
  product_images?: ProductImage[]
  categories?: {
    id: string
    name: string
    slug: string
  }[]
  slug: string
  quantity: number
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