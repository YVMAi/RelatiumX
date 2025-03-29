
import { supabase } from '@/integrations/supabase/client';
import { 
  Lead, LeadInsert, 
  Profile, ProfileInsert,
  LeadStage,
  Notification,
  ScheduledTask, ScheduledTaskInsert 
} from '@/types/supabase';

// Profile services
export const profileService = {
  getCurrentProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as Profile;
  },

  updateProfile: async (profile: Partial<ProfileInsert>) => {
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id!);
    
    return { error };
  }
};

// Lead services
export const leadService = {
  getLeads: async () => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        owner:profiles(*),
        stage:lead_stages(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
    
    return data as (Lead & { 
      owner: Profile, 
      stage: LeadStage 
    })[];
  },

  getLead: async (id: number) => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        owner:profiles(*),
        stage:lead_stages(*),
        team:lead_team(user_id, profiles(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching lead:', error);
      return null;
    }
    
    return data;
  },

  createLead: async (lead: LeadInsert) => {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select('*')
      .single();
    
    return { data, error };
  },

  updateLead: async (id: number, lead: Partial<LeadInsert>) => {
    const { data, error } = await supabase
      .from('leads')
      .update(lead)
      .eq('id', id)
      .select('*')
      .single();
    
    return { data, error };
  }
};

// Lead stages service
export const leadStageService = {
  getLeadStages: async () => {
    const { data, error } = await supabase
      .from('lead_stages')
      .select('*')
      .order('sequence', { ascending: true });
    
    if (error) {
      console.error('Error fetching lead stages:', error);
      return [];
    }
    
    return data as LeadStage[];
  }
};

// Notification service
export const notificationService = {
  getNotifications: async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data as Notification[];
  },
  
  markAsRead: async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    return { error };
  }
};

// Tasks service
export const taskService = {
  getTasks: async () => {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .select(`
        *,
        lead:leads(*),
        assignee:profiles(*)
      `)
      .order('scheduled_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    
    return data as (ScheduledTask & {
      lead: Lead,
      assignee: Profile
    })[];
  },
  
  createTask: async (task: ScheduledTaskInsert) => {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .insert(task)
      .select()
      .single();
    
    return { data, error };
  },
  
  updateTaskStatus: async (id: number, status: 'pending' | 'completed' | 'cancelled') => {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }
};
