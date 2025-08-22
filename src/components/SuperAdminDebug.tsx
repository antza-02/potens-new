import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../contexts/AuthContext';

export const SuperAdminDebug = () => {
  const { user } = useAuth();
  const { profile, loading, error, isSuperAdmin, isAdmin, isSuperAdminRole } = useUserProfile();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">SuperAdmin Debug Info:</h3>
      <div className="space-y-1">
        <div>User ID: {user?.id || 'No user'}</div>
        <div>User Email: {user?.email || 'No email'}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Error: {error || 'None'}</div>
        <div>Profile: {profile ? 'Loaded' : 'Not loaded'}</div>
        <div>isSuperAdmin: {isSuperAdmin ? 'Yes' : 'No'}</div>
        <div>isAdmin: {isAdmin ? 'Yes' : 'No'}</div>
        <div>isSuperAdminRole: {isSuperAdminRole ? 'Yes' : 'No'}</div>
        <div>Profile Role: {profile?.role || 'No role'}</div>
        <div>Profile is_super_admin: {profile?.is_super_admin ? 'Yes' : 'No'}</div>
        <div>User Metadata Role: {user?.user_metadata?.role || 'No metadata role'}</div>
      </div>
    </div>
  );
};

