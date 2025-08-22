import { supabase } from './supabase';

// Email invitation system using Supabase
export const sendUserInvitation = async (email: string, fullName: string, role: string): Promise<{ success: boolean; error?: string; invitationId?: string }> => {
  try {
    // First, create the invitation record
    const { data: invitationData, error: invitationError } = await supabase
      .from('user_invitations')
      .insert([{
        email: email,
        full_name: fullName,
        role: role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending',
        invitation_token: generateInvitationToken()
      }])
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return { success: false, error: invitationError.message };
    }

    // Send the invitation email using Supabase's email function
    const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        email: email,
        fullName: fullName,
        role: role,
        invitationToken: invitationData.invitation_token,
        inviteUrl: `${window.location.origin}/accept-invitation?token=${invitationData.invitation_token}`
      }
    });

    if (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Even if email fails, the invitation was created, so we'll return success
      // but log the email error
      return { 
        success: true, 
        error: `Invitation created but email failed: ${emailError.message}`,
        invitationId: invitationData.id
      };
    }

    return { 
      success: true, 
      invitationId: invitationData.id 
    };
  } catch (error) {
    console.error('Error in sendUserInvitation:', error);
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

// Alternative: Use Supabase's built-in email functionality
export const sendUserInvitationSimple = async (email: string, fullName: string, role: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create the invitation record
    const { data: invitationData, error: invitationError } = await supabase
      .from('user_invitations')
      .insert([{
        email: email,
        full_name: fullName,
        role: role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return { success: false, error: invitationError.message };
    }

    // Send a simple invitation email using Supabase's email templates
    // This will use the default email templates if configured
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        data: {
          full_name: fullName,
          role: role,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          invitation_id: invitationData.id
        }
      }
    });

    if (emailError) {
      console.error('Error generating signup link:', emailError);
      // Return success anyway since the invitation was created
      return { 
        success: true, 
        error: `Invitation created but signup link failed: ${emailError.message}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendUserInvitationSimple:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
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
