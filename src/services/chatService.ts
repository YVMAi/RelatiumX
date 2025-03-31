import { supabase } from "@/integrations/supabase/client";
import { LeadMessage, LeadMessageInsert, MessageMentionInsert, MessageAttachmentInsert, Profile } from "@/types/supabase";

// Fetch messages for a lead
export const fetchLeadMessages = async (leadId: number) => {
  try {
    const { data, error } = await supabase
      .from('lead_messages')
      .select(`
        *,
        profiles:user_id(*),
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
        profiles:user_id(*),
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
        profiles:user_id(*),
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
export const fetchMentionableUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, created_at, updated_at, role_id');

    if (error) {
      console.error('Error fetching mentionable users:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchMentionableUsers:', error);
    return [];
  }
};
