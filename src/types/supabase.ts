
import { Database } from '@/integrations/supabase/types';

// Export type-safe tables from the Database type
export type Tables = Database['public']['Tables'];

// Define type-safe table row types
export type Profile = Tables['profiles']['Row'];
export type Lead = Tables['leads']['Row'];
export type LeadStage = Tables['lead_stages']['Row'];
export type LeadTeam = Tables['lead_team']['Row'];
export type ScheduledTask = Tables['scheduled_tasks']['Row'];
export type Notification = Tables['notifications']['Row'];
export type MasterSetting = Tables['master_settings']['Row'];
export type AuditLog = Tables['audit_logs']['Row'];
export type LeadChangeLog = Tables['lead_change_logs']['Row'];
export type Role = Tables['roles']['Row'];
export type LeadMessage = Tables['lead_messages']['Row'];
export type MessageMention = Tables['message_mentions']['Row'];
export type MessageAttachment = Tables['message_attachments']['Row'];

// Define type-safe insert types
export type ProfileInsert = Tables['profiles']['Insert'];
export type LeadInsert = Tables['leads']['Insert'];
export type LeadTeamInsert = Tables['lead_team']['Insert'];
export type ScheduledTaskInsert = Tables['scheduled_tasks']['Insert'];
export type NotificationInsert = Tables['notifications']['Insert'];
export type LeadMessageInsert = Tables['lead_messages']['Insert'];
export type MessageMentionInsert = Tables['message_mentions']['Insert'];
export type MessageAttachmentInsert = Tables['message_attachments']['Insert'];

// Type-safe enum types
export type LeadStatus = Database['public']['Enums']['lead_status'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type AppRole = Database['public']['Enums']['app_role'];
