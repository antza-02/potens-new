import { supabase, Venue, Booking, User, UserActivityLog, UserRole } from './supabase'

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

// Enhanced User Management Functions for SuperAdmin
export const inviteUser = async (email: string, fullName: string, role: UserRole): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    // First, create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: generateTemporaryPassword(),
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
        invited_by: (await supabase.auth.getUser()).data.user?.id
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Update the profile with the correct role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: role,
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Try to clean up the auth user if profile update fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: profileError.message };
    }

    // Log the invitation
    await logUserActivity(authData.user.id, 'user_invited', { 
      invited_by: (await supabase.auth.getUser()).data.user?.id,
      role: role 
    });

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, delete the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return { success: false, error: profileError.message };
    }

    // Then delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      return { success: false, error: authError.message };
    }

    // Log the deletion
    await logUserActivity(userId, 'user_deleted', { 
      deleted_by: (await supabase.auth.getUser()).data.user?.id 
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const disableUser = async (userId: string, disabled: boolean): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_active: !disabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return { success: false, error: error.message };
    }

    // Log the status change
    await logUserActivity(userId, disabled ? 'user_disabled' : 'user_enabled', { 
      changed_by: (await supabase.auth.getUser()).data.user?.id 
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }

    // Log the password reset request
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userData?.id) {
      await logUserActivity(userData.id, 'password_reset_requested', { 
        requested_by: (await supabase.auth.getUser()).data.user?.id 
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to generate temporary password
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// City Owner functions
export const getCityOwnerVenues = async (ownerId: string): Promise<Venue[]> => {
  // Since owner_id column doesn't exist, return all venues for now
  // TODO: Add owner_id column to venues table if needed
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching city owner venues:', error)
    return []
  }

  return data || []
}

export const getCityOwnerBookings = async (ownerId: string): Promise<Booking[]> => {
  // Since owner_id column doesn't exist in venues, return all bookings for now
  // TODO: Add owner_id column to venues table if needed
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
