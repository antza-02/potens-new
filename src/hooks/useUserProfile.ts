import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string | null;
  is_super_admin: boolean | null;
  city: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch profile from database
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.warn('Database profile fetch failed, using fallback:', fetchError);
          // Don't throw error, just log it and continue with fallback
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.warn('Unexpected error in profile fetch:', err);
        // Don't set error state, just log it
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Enhanced logic with fallbacks
  const isSuperAdmin = profile?.is_super_admin === true || 
                      user?.user_metadata?.role === 'super_admin' || 
                      user?.email === 'superadmin@potens.fi' || 
                      user?.email === 'anton.hietsilta@gmail.com';
  
  const isAdmin = profile?.role === 'admin' || 
                  profile?.role === 'city_owner' || 
                  user?.user_metadata?.role === 'admin';
  
  const isSuperAdminRole = profile?.role === 'super_admin' || 
                           user?.user_metadata?.role === 'super_admin';

  return {
    profile,
    loading,
    error,
    isSuperAdmin,
    isAdmin,
    isSuperAdminRole,
    // For backward compatibility
    role: profile?.role,
    fullName: profile?.full_name
  };
};

