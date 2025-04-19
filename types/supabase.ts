export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      delivery_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          full_name: string
          id: string
          order_id: string | null
          phone: string | null
          postal_code: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country: string
          created_at?: string | null
          full_name: string
          id?: string
          order_id?: string | null
          phone?: string | null
          postal_code: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          full_name?: string
          id?: string
          order_id?: string | null
          phone?: string | null
          postal_code?: string
          state?: string
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
      }
      orders: {
        Row: {
          created_at: string
          id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
      }
      products: {
        Row: {
          color: string | null
          cost: number
          created_at: string
          description: string | null
          gender: "male" | "female" | "unisex" | null
          id: string
          image_url: string | null
          name: string
          size: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          cost: number
          created_at?: string
          description?: string | null
          gender?: "male" | "female" | "unisex" | null
          id?: string
          image_url?: string | null
          name: string
          size?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          gender?: "male" | "female" | "unisex" | null
          id?: string
          image_url?: string | null
          name?: string
          size?: string | null
          updated_at?: string
          user_id?: string | null
        }
      }
    }
    Enums: {
      gender_type: "male" | "female" | "unisex"
    }
  }
} 