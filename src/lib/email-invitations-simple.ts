import { supabase } from './supabase';

// Simple invitation system that just creates database records
// No auth user creation - just invitation management
export const sendUserInvitationSimple = async (email: string, fullName: string, role: string): Promise<{ success: boolean; error?: string; invitationId?: string }> => {
  try {
    console.log('Starting simple invitation process for:', email, fullName, role);

    // Step 1: Create the invitation record
    const { data: invitationData, error: invitationError } = await supabase
      .from('user_invitations')
      .insert([{
        email: email,
        full_name: fullName,
        role: role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending',
        invitation_token: generateInvitationToken(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }])
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation record:', invitationError);
      return { success: false, error: invitationError.message };
    }

    console.log('Invitation record created successfully:', invitationData.id);

    // Step 2: Update status to indicate invitation was created
    await supabase
      .from('user_invitations')
      .update({ 
        status: 'invitation_created',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationData.id);

    console.log('Invitation process completed successfully');

    return { 
      success: true, 
      invitationId: invitationData.id 
    };

  } catch (error) {
    console.error('Error in sendUserInvitationSimple:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Generate a secure invitation token
const generateInvitationToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Get all invitations (including all statuses)
export const getAllInvitations = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all invitations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllInvitations:', error);
    return [];
  }
};

// Get pending invitations only
export const getPendingInvitations = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending invitations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPendingInvitations:', error);
    return [];
  }
};

// Cancel an invitation
export const cancelInvitation = async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);

    if (error) {
      console.error('Error cancelling invitation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in cancelInvitation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Resend invitation (just update status, no email sending)
export const resendInvitation = async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update the invitation status to indicate it was resent
    const { error } = await supabase
      .from('user_invitations')
      .update({ 
        status: 'invitation_resent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    if (error) {
      console.error('Error updating invitation status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resendInvitation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
    }
};

// Get invitation statistics
export const getInvitationStats = async (): Promise<{ total: number; pending: number; sent: number; cancelled: number }> => {
  try {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('status');

    if (error) {
      console.error('Error fetching invitation stats:', error);
      return { total: 0, pending: 0, sent: 0, cancelled: 0 };
    }

    const stats = {
      total: data.length,
      pending: data.filter(inv => inv.status === 'pending').length,
      sent: data.filter(inv => inv.status === 'invitation_created' || inv.status === 'invitation_resent').length,
      cancelled: data.filter(inv => inv.status === 'cancelled').length
    };

    return stats;
  } catch (error) {
    console.error('Error in getInvitationStats:', error);
    return { total: 0, pending: 0, sent: 0, cancelled: 0 };
  }
};
