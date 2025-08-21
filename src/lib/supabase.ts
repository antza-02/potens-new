import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Venue {
  id: number
  name: string
  type: string
  city: string
  price: number
  rating: number
  reviews: number
  image: string
  amenities: string[]
  capacity: number
  description: string
  owner_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  venue_id: number
  user_id: string
  start_time: string
  end_time: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'city_owner' | 'super_admin'
  city?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserActivityLog {
  id: number
  user_id: string
  action: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export type UserRole = 'user' | 'city_owner' | 'super_admin'
