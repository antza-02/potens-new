import { supabase, Venue, Booking, User, UserActivityLog, UserRole } from './supabase'

// Venue functions
export const getVenues = async (): Promise<Venue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
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
    .eq('is_active', true)

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

// Super Admin functions
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

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all users:', error)
    return []
  }

  return data || []
}

export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    return false
  }

  return true
}

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user status:', error)
    return false
  }

  return true
}

export const getUserActivityLogs = async (userId?: string): Promise<UserActivityLog[]> => {
  let query = supabase
    .from('user_activity_log')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user activity logs:', error)
    return []
  }

  return data || []
}

export const logUserActivity = async (userId: string, action: string, details?: any): Promise<boolean> => {
  const { error } = await supabase
    .from('user_activity_log')
    .insert([{
      user_id: userId,
      action,
      details
    }])

  if (error) {
    console.error('Error logging user activity:', error)
    return false
  }

  return true
}

// City Owner functions
export const getCityOwnerVenues = async (ownerId: string): Promise<Venue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching city owner venues:', error)
    return []
  }

  return data || []
}

export const getCityOwnerBookings = async (ownerId: string): Promise<Booking[]> => {
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
    .eq('venues.owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching city owner bookings:', error)
    return []
  }

  return data || []
}

// Venue management functions
export const createVenue = async (venue: Omit<Venue, 'id' | 'created_at' | 'updated_at'>): Promise<Venue | null> => {
  const { data, error } = await supabase
    .from('venues')
    .insert([venue])
    .select()
    .single()

  if (error) {
    console.error('Error creating venue:', error)
    return null
  }

  return data
}

export const updateVenue = async (venueId: number, updates: Partial<Venue>): Promise<boolean> => {
  const { error } = await supabase
    .from('venues')
    .update(updates)
    .eq('id', venueId)

  if (error) {
    console.error('Error updating venue:', error)
    return false
  }

  return true
}

export const deleteVenue = async (venueId: number): Promise<boolean> => {
  const { error } = await supabase
    .from('venues')
    .delete()
    .eq('id', venueId)

  if (error) {
    console.error('Error deleting venue:', error)
    return false
  }

  return true
}
