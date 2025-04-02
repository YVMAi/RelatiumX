
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
  client_industry?: string;
  owner_id?: string | null;
  owner?: {
    id: string;
    name: string;
  };
}

export interface LeadStage {
  id: number;
  stage_name: string;
  sequence: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  newLeads: number;
  pipelineLeads: number;
  convertedLeads: number;
  lostLeads: number;
  totalValue: number;
  conversionRate: number;
  averageDealSize: number;
  topIndustry: {
    name: string;
    count: number;
  };
  topPerformer: {
    name: string;
    leads: number;
  };
  popularProduct: {
    name: string;
    count: number;
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface IndustryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TeamPerformanceData {
  name: string;
  leads: number;
  value: number;
}

export interface StageData {
  name: string;
  leadCount: number;
  value: number;
}

export interface TrendData {
  date: string;
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
}
