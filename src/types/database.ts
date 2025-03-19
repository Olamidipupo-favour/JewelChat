export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          role: 'user' | 'admin'
          is_active: boolean
          tokens: number
          stripe_customer_id?: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          role?: 'user' | 'admin'
          is_active?: boolean
          tokens?: number
          stripe_customer_id?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          role?: 'user' | 'admin'
          is_active?: boolean
          tokens?: number
          stripe_customer_id?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key: string
          created_at: string
          last_used: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key: string
          created_at?: string
          last_used?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key?: string
          created_at?: string
          last_used?: string | null
        }
      }
      api_usage: {
        Row: {
          id: string
          user_id: string
          api_type: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat'
          tokens_used: number
          created_at: string
          cost: number
        }
        Insert: {
          id?: string
          user_id: string
          api_type: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat'
          tokens_used: number
          created_at?: string
          cost: number
        }
        Update: {
          id?: string
          user_id?: string
          api_type?: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat'
          tokens_used?: number
          created_at?: string
          cost?: number
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          tokens: number
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          razorpay_order_id: string
          razorpay_payment_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          tokens: number
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          razorpay_order_id: string
          razorpay_payment_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          tokens?: number
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          razorpay_order_id?: string
          razorpay_payment_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_pricing: {
        Row: {
          id: string
          api_type: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat'
          tokens_per_request: number
          cost_per_token: number
          updated_at: string
        }
        Insert: {
          id?: string
          api_type: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat'
          tokens_per_request: number
          cost_per_token: number
          updated_at?: string
        }
        Update: {
          id?: string
          api_type?: 'stable_diffusion' | 'perplexity' | 'gpt4' | 'chat'
          tokens_per_request?: number
          cost_per_token?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 