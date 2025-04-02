import { supabase } from "@/integrations/supabase/client";
import { LeadMessage, LeadMessageInsert, MessageMentionInsert, MessageAttachmentInsert, Profile, MessageReadReceiptInsert } from "@/types/supabase";

// Fetch messages for a lead
export const fetchLeadMessages = async (leadId: number) => {
  try {
    const { data, error } = await supabase
      .from('lead_messages')
      .select(`
        *,
        profiles!lead_messages_user_id_fkey(*),
        mentions:message_mentions(*),
        attachments:message_attachments(*)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching lead messages:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchLeadMessages:', error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (message: LeadMessageInsert) => {
  try {
    const { data, error } = await supabase
      .from('lead_messages')
      .insert(message)
      .select(`
        *,
        profiles!lead_messages_user_id_fkey(*),
        mentions:message_mentions(*),
        attachments:message_attachments(*)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

// Update an existing message
export const updateMessage = async (messageId: string, message: string) => {
  try {
    const { data, error } = await supabase
      .from('lead_messages')
      .update({ 
        message, 
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select(`
        *,
        profiles!lead_messages_user_id_fkey(*),
        mentions:message_mentions(*),
        attachments:message_attachments(*)
      `)
      .single();

    if (error) {
      console.error('Error updating message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateMessage:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId: string) => {
  try {
    const { error } = await supabase
      .from('lead_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    throw error;
  }
};

// Add mentions to a message
export const addMentions = async (messageId: string, userIds: string[]) => {
  try {
    if (!userIds.length) return [];
    
    const mentions = userIds.map(userId => ({
      message_id: messageId,
      mentioned_user_id: userId,
    } as MessageMentionInsert));

    const { data, error } = await supabase
      .from('message_mentions')
      .insert(mentions)
      .select();

    if (error) {
      console.error('Error adding mentions:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addMentions:', error);
    throw error;
  }
};

// Parse message text for mentions (@username)
export const parseMessageForMentions = (message: string, users: Profile[]): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = message.match(mentionRegex) || [];
  
  const mentionedUserIds: string[] = [];
  
  matches.forEach(match => {
    const username = match.substring(1); // Remove the @ symbol
    const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
    if (user && !mentionedUserIds.includes(user.id)) {
      mentionedUserIds.push(user.id);
    }
  });
  
  return mentionedUserIds;
};

// Mark mention as read
export const markMentionAsRead = async (mentionId: string) => {
  try {
    const { data, error } = await supabase
      .from('message_mentions')
      .update({ is_read: true })
      .eq('id', mentionId)
      .select()
      .single();

    if (error) {
      console.error('Error marking mention as read:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in markMentionAsRead:', error);
    throw error;
  }
};

// Subscribe to real-time updates for a lead's messages
export const subscribeToLeadMessages = (
  leadId: number, 
  onInsert: (payload: any) => void,
  onUpdate: (payload: any) => void,
  onDelete: (payload: any) => void
) => {
  return supabase
    .channel(`lead-messages-${leadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'lead_messages',
        filter: `lead_id=eq.${leadId}`
      },
      onInsert
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'lead_messages',
        filter: `lead_id=eq.${leadId}`
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'lead_messages',
        filter: `lead_id=eq.${leadId}`
      },
      onDelete
    )
    .subscribe();
};

// Get all users for @mentions
export const fetchMentionableUsers = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, created_at, updated_at, role_id');

    if (error) {
      console.error('Error fetching mentionable users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchMentionableUsers:', error);
    return [];
  }
};

// Upload a file attachment for a message
export const uploadAttachment = async (
  file: File,
  leadId: number
): Promise<{ path: string; name: string; size: number; type: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `lead_${leadId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }
    
    return {
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error in uploadAttachment:', error);
    throw error;
  }
};

// Add an attachment to a message
export const addAttachment = async (messageId: string, fileInfo: {
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
}) => {
  try {
    const attachment: MessageAttachmentInsert = {
      message_id: messageId,
      file_path: fileInfo.file_path,
      file_name: fileInfo.file_name,
      file_size: fileInfo.file_size,
      file_type: fileInfo.file_type,
    };
    
    const { data, error } = await supabase
      .from('message_attachments')
      .insert(attachment)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addAttachment:', error);
    throw error;
  }
};

// Download an attachment
export const downloadAttachment = async (filePath: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('chat_attachments')
      .createSignedUrl(filePath, 60); // 60 seconds expiry
    
    if (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in downloadAttachment:', error);
    throw error;
  }
};

// Mark message as delivered for a user
export const markMessageAsDelivered = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('lead_messages')
      .update({ 
        message_status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in markMessageAsDelivered:', error);
    throw error;
  }
};

// Mark message as read by a user
export const markMessageAsRead = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('message_read_receipts')
      .upsert({
        message_id: messageId,
        user_id: supabase.auth.getUser().then(res => res.data.user?.id || ''),
        read_at: new Date().toISOString(),
      }, 
      { 
        onConflict: 'message_id,user_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    throw error;
  }
};

// Fetch team members who can access the lead chat
export const fetchLeadTeamMembers = async (leadId: number): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('lead_team')
      .select('user_id, profiles(*)')
      .eq('lead_id', leadId);
    
    if (error) {
      console.error('Error fetching lead team members:', error);
      throw error;
    }
    
    return data.map((member: any) => member.profiles) || [];
  } catch (error) {
    console.error('Error in fetchLeadTeamMembers:', error);
    return [];
  }
};
