import { supabase, Venue, Booking } from './supabase'

// Venue functions
export const getVenues = async (): Promise<Venue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching venues:', error)
    return []
  }

  return data || []
}

export const getVenueById = async (id: number): Promise<Venue | null> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching venue:', error)
    return null
  }

  return data
}

export const searchVenues = async (query: string, city?: string, type?: string): Promise<Venue[]> => {
  let queryBuilder = supabase
    .from('venues')
    .select('*')

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  }

  if (city) {
    queryBuilder = queryBuilder.eq('city', city)
  }

  if (type) {
    queryBuilder = queryBuilder.eq('type', type)
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching venues:', error)
    return []
  }

  return data || []
}

// Booking functions
export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    return null
  }

  return data
}

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venues (
        id,
        name,
        type,
        city,
        image
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }

  return data || []
}

export const updateBookingStatus = async (bookingId: number, status: Booking['status']): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)

  if (error) {
    console.error('Error updating booking:', error)
    return false
  }

  return true
}

// Admin functions
export const getAllBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venues (
        id,
        name,
        type,
        city
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all bookings:', error)
    return []
  }

  return data || []
}
