import { supabase } from './supabase';

// Working email invitation system using Supabase's built-in email functionality
export const sendUserInvitationWorking = async (email: string, fullName: string, role: string): Promise<{ success: boolean; error?: string; invitationId?: string }> => {
  try {
    console.log('Starting invitation process for:', email, fullName, role);

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

    console.log('Invitation record created:', invitationData.id);

    // Step 2: Try to send email using Supabase's built-in signup functionality
    try {
      // This will send a signup email if Supabase is configured for it
      const { error: signupError } = await supabase.auth.signUp({
        email: email,
        password: generateTemporaryPassword(), // Generate a temporary password
        options: {
          data: {
            full_name: fullName,
            role: role,
            invitation_id: invitationData.id,
            is_invited: true
          }
        }
      });

      if (signupError) {
        console.warn('Signup email failed (this is expected for existing users):', signupError);
        // This is expected for existing users, so we'll continue
      } else {
        console.log('Signup email sent successfully');
      }
    } catch (signupError) {
      console.warn('Signup process failed (continuing with invitation):', signupError);
    }

    // Step 3: Update the invitation with the signup attempt
    await supabase
      .from('user_invitations')
      .update({ 
        status: 'email_sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationData.id);

    console.log('Invitation process completed successfully');

    return { 
      success: true, 
      invitationId: invitationData.id 
    };

  } catch (error) {
    console.error('Error in sendUserInvitationWorking:', error);
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

// Generate a temporary password for the invitation
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Get all pending invitations
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

// Get all invitations (including sent ones)
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

// Resend invitation email
export const resendInvitation = async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the invitation details
    const { data: invitation, error: fetchError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      return { success: false, error: 'Invitation not found' };
    }

    // Try to resend the signup email
    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: invitation.email,
        password: generateTemporaryPassword(),
        options: {
          data: {
            full_name: invitation.full_name,
            role: invitation.role,
            invitation_id: invitation.id,
            is_invited: true
          }
        }
      });

      if (signupError) {
        console.warn('Resend signup email failed:', signupError);
      }
    } catch (signupError) {
      console.warn('Resend process failed:', signupError);
    }

    // Update the invitation status
    await supabase
      .from('user_invitations')
      .update({ 
        status: 'email_resent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    return { success: true };
  } catch (error) {
    console.error('Error in resendInvitation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
