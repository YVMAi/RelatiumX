
// We're not importing LeadStage from supabase since we're defining it here
// This was causing the conflict error

export interface Lead {
  id: number;
  client_company: string;
  contact_name: string;
  contact_email: string;
  stage_id: number;
  estimated_value: number;
  next_activity: string;
  lead_stages?: LeadStage;
}

export interface LeadStage {
  id: number;
  stage_name: string;
  sequence: number;
  created_at?: string;
  updated_at?: string;
}
