import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadStage } from "@/types/supabase";

export type DateRangeFilter = {
  startDate?: string;
  endDate?: string;
};

export type LeadFilter = {
  owners?: string[];
  industries?: string[];
  products?: string[];
  stages?: number[];
  dateRange?: DateRangeFilter;
};

export type DashboardMetrics = {
  newLeads: number;
  pipelineLeads: number;
  convertedLeads: number;
  lostLeads: number;
  totalLeadValue: number;
  conversionRate: number;
};

export type LeadsByStage = {
  stageId: number;
  stageName: string;
  count: number;
  value: number;
};

export type LeadsByIndustry = {
  industry: string;
  count: number;
  value: number;
};

export type LeadsByOwner = {
  ownerId: string;
  ownerName: string;
  count: number;
  value: number;
};

export type LeadTrendData = {
  date: string;
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
};

export const fetchDashboardMetrics = async (filters?: LeadFilter): Promise<DashboardMetrics> => {
  try {
    let query = supabase.from('leads').select('*');

    // Apply filters
    if (filters) {
      if (filters.owners && filters.owners.length > 0) {
        query = query.in('owner_id', filters.owners);
      }
      
      if (filters.industries && filters.industries.length > 0) {
        query = query.in('client_industry', filters.industries);
      }
      
      if (filters.products && filters.products.length > 0) {
        query = query.overlaps('products', filters.products);
      }
      
      if (filters.stages && filters.stages.length > 0) {
        query = query.in('stage_id', filters.stages);
      }
      
      if (filters.dateRange) {
        if (filters.dateRange.startDate) {
          query = query.gte('created_at', filters.dateRange.startDate);
        }
        if (filters.dateRange.endDate) {
          query = query.lte('created_at', filters.dateRange.endDate);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }

    // Process the data to calculate metrics
    const leads = data as Lead[];
    const newLeads = leads.filter(lead => {
      // Consider a lead as "new" if it's in the first stage or we don't have stages data
      return !lead.stage_id || lead.stage_id === 1;
    }).length;
    
    const pipelineLeads = leads.filter(lead => {
      // Leads that are not in the first, won, or lost stages
      return lead.stage_id && lead.stage_id > 1 && lead.stage_id < 6;
    }).length;
    
    const convertedLeads = leads.filter(lead => {
      // Assuming stage_id 6 is for converted/won leads
      return lead.stage_id === 6;
    }).length;
    
    const lostLeads = leads.filter(lead => {
      // Assuming stage_id 7 is for lost leads
      return lead.stage_id === 7;
    }).length;
    
    const totalLeadValue = leads.reduce((sum, lead) => {
      return sum + (lead.estimated_value || 0);
    }, 0);
    
    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      newLeads,
      pipelineLeads,
      convertedLeads,
      lostLeads,
      totalLeadValue,
      conversionRate
    };
  } catch (error) {
    console.error('Error in fetchDashboardMetrics:', error);
    // Return default values in case of error
    return {
      newLeads: 0,
      pipelineLeads: 0,
      convertedLeads: 0,
      lostLeads: 0,
      totalLeadValue: 0,
      conversionRate: 0
    };
  }
};

export const fetchLeadsByStage = async (filters?: LeadFilter): Promise<LeadsByStage[]> => {
  try {
    // First get all lead stages
    const { data: stagesData, error: stagesError } = await supabase
      .from('lead_stages')
      .select('*')
      .order('sequence', { ascending: true });
    
    if (stagesError) {
      console.error('Error fetching lead stages:', stagesError);
      throw stagesError;
    }
    
    const stages = stagesData as LeadStage[];
    
    // Now get leads with filtering
    let query = supabase.from('leads').select('*');
    
    // Apply filters
    if (filters) {
      if (filters.owners && filters.owners.length > 0) {
        query = query.in('owner_id', filters.owners);
      }
      
      if (filters.industries && filters.industries.length > 0) {
        query = query.in('client_industry', filters.industries);
      }
      
      if (filters.products && filters.products.length > 0) {
        query = query.overlaps('products', filters.products);
      }
      
      if (filters.dateRange) {
        if (filters.dateRange.startDate) {
          query = query.gte('created_at', filters.dateRange.startDate);
        }
        if (filters.dateRange.endDate) {
          query = query.lte('created_at', filters.dateRange.endDate);
        }
      }
    }
    
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw leadsError;
    }
    
    const leads = leadsData as Lead[];
    
    // Calculate counts and values for each stage
    return stages.map(stage => {
      const stageLeads = leads.filter(lead => lead.stage_id === stage.id);
      const count = stageLeads.length;
      const value = stageLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
      
      return {
        stageId: stage.id,
        stageName: stage.stage_name,
        count,
        value
      };
    });
  } catch (error) {
    console.error('Error in fetchLeadsByStage:', error);
    return [];
  }
};

export const fetchLeadsByIndustry = async (filters?: LeadFilter): Promise<LeadsByIndustry[]> => {
  try {
    let query = supabase.from('leads').select('*');
    
    // Apply filters
    if (filters) {
      if (filters.owners && filters.owners.length > 0) {
        query = query.in('owner_id', filters.owners);
      }
      
      if (filters.industries && filters.industries.length > 0) {
        query = query.in('client_industry', filters.industries);
      }
      
      if (filters.products && filters.products.length > 0) {
        query = query.overlaps('products', filters.products);
      }
      
      if (filters.stages && filters.stages.length > 0) {
        query = query.in('stage_id', filters.stages);
      }
      
      if (filters.dateRange) {
        if (filters.dateRange.startDate) {
          query = query.gte('created_at', filters.dateRange.startDate);
        }
        if (filters.dateRange.endDate) {
          query = query.lte('created_at', filters.dateRange.endDate);
        }
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leads by industry:', error);
      throw error;
    }
    
    const leads = data as Lead[];
    
    // Group leads by industry
    const industryMap = new Map<string, { count: number; value: number }>();
    
    leads.forEach(lead => {
      const industry = lead.client_industry || 'Unknown';
      const value = lead.estimated_value || 0;
      
      if (industryMap.has(industry)) {
        const current = industryMap.get(industry)!;
        industryMap.set(industry, {
          count: current.count + 1,
          value: current.value + value
        });
      } else {
        industryMap.set(industry, { count: 1, value });
      }
    });
    
    // Convert map to array
    return Array.from(industryMap.entries()).map(([industry, data]) => ({
      industry,
      count: data.count,
      value: data.value
    }));
  } catch (error) {
    console.error('Error in fetchLeadsByIndustry:', error);
    return [];
  }
};

export const fetchLeadsByOwner = async (filters?: LeadFilter): Promise<LeadsByOwner[]> => {
  try {
    // Get all profiles first for owner information
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // Now get leads with filtering
    let query = supabase.from('leads').select('*');
    
    // Apply filters
    if (filters) {
      if (filters.owners && filters.owners.length > 0) {
        query = query.in('owner_id', filters.owners);
      }
      
      if (filters.industries && filters.industries.length > 0) {
        query = query.in('client_industry', filters.industries);
      }
      
      if (filters.products && filters.products.length > 0) {
        query = query.overlaps('products', filters.products);
      }
      
      if (filters.stages && filters.stages.length > 0) {
        query = query.in('stage_id', filters.stages);
      }
      
      if (filters.dateRange) {
        if (filters.dateRange.startDate) {
          query = query.gte('created_at', filters.dateRange.startDate);
        }
        if (filters.dateRange.endDate) {
          query = query.lte('created_at', filters.dateRange.endDate);
        }
      }
    }
    
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw leadsError;
    }
    
    const profiles = profilesData as { id: string; name: string }[];
    const leads = leadsData as Lead[];
    
    // Group leads by owner
    const ownerMap = new Map<string, { count: number; value: number; name: string }>();
    
    leads.forEach(lead => {
      if (!lead.owner_id) return;
      
      const owner = profiles.find(p => p.id === lead.owner_id);
      const ownerName = owner ? owner.name : 'Unknown';
      const value = lead.estimated_value || 0;
      
      if (ownerMap.has(lead.owner_id)) {
        const current = ownerMap.get(lead.owner_id)!;
        ownerMap.set(lead.owner_id, {
          count: current.count + 1,
          value: current.value + value,
          name: ownerName
        });
      } else {
        ownerMap.set(lead.owner_id, { count: 1, value, name: ownerName });
      }
    });
    
    // Convert map to array
    return Array.from(ownerMap.entries()).map(([ownerId, data]) => ({
      ownerId,
      ownerName: data.name,
      count: data.count,
      value: data.value
    }));
  } catch (error) {
    console.error('Error in fetchLeadsByOwner:', error);
    return [];
  }
};

export const fetchLeadTrends = async (filters?: LeadFilter): Promise<LeadTrendData[]> => {
  try {
    let query = supabase.from('leads').select('*');
    
    // Apply filters
    if (filters) {
      if (filters.owners && filters.owners.length > 0) {
        query = query.in('owner_id', filters.owners);
      }
      
      if (filters.industries && filters.industries.length > 0) {
        query = query.in('client_industry', filters.industries);
      }
      
      if (filters.products && filters.products.length > 0) {
        query = query.overlaps('products', filters.products);
      }
      
      if (filters.stages && filters.stages.length > 0) {
        query = query.in('stage_id', filters.stages);
      }
      
      // For trends, we need a date range, but we'll use a wider range if not specified
      if (!filters.dateRange) {
        // Default to last 6 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 6);
        
        query = query.gte('created_at', startDate.toISOString());
        query = query.lte('created_at', endDate.toISOString());
      } else {
        if (filters.dateRange.startDate) {
          query = query.gte('created_at', filters.dateRange.startDate);
        }
        if (filters.dateRange.endDate) {
          query = query.lte('created_at', filters.dateRange.endDate);
        }
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leads for trends:', error);
      throw error;
    }
    
    const leads = data as Lead[];
    
    // Group leads by month
    const trendMap = new Map<string, { 
      newLeads: number; 
      convertedLeads: number; 
      lostLeads: number 
    }>();
    
    leads.forEach(lead => {
      const createdAt = new Date(lead.created_at || '');
      const month = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trendMap.has(month)) {
        trendMap.set(month, { newLeads: 0, convertedLeads: 0, lostLeads: 0 });
      }
      
      const current = trendMap.get(month)!;
      
      // Count as new lead
      current.newLeads++;
      
      // Also count as converted or lost if applicable
      if (lead.stage_id === 6) { // Assuming 6 is for converted/won
        current.convertedLeads++;
      } else if (lead.stage_id === 7) { // Assuming 7 is for lost
        current.lostLeads++;
      }
      
      trendMap.set(month, current);
    });
    
    // Sort by month and convert to array
    return Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error in fetchLeadTrends:', error);
    return [];
  }
};

export const fetchFilterOptions = async () => {
  try {
    // Get list of owners (profiles)
    const { data: owners, error: ownersError } = await supabase
      .from('profiles')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (ownersError) {
      console.error('Error fetching owners:', ownersError);
      throw ownersError;
    }
    
    // Get list of lead stages
    const { data: stages, error: stagesError } = await supabase
      .from('lead_stages')
      .select('id, stage_name')
      .order('sequence', { ascending: true });
    
    if (stagesError) {
      console.error('Error fetching stages:', stagesError);
      throw stagesError;
    }
    
    // Get unique industries and products from leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('client_industry, products');
    
    if (leadsError) {
      console.error('Error fetching leads for options:', leadsError);
      throw leadsError;
    }
    
    // Extract unique industries
    const industries = Array.from(new Set(
      leads
        .map(lead => lead.client_industry)
        .filter(Boolean) as string[]
    )).sort();
    
    // Extract unique products
    const products = Array.from(new Set(
      leads
        .flatMap(lead => lead.products || [])
        .filter(Boolean)
    )).sort();
    
    return {
      owners: owners as { id: string; name: string }[],
      stages: stages as { id: number; stage_name: string }[],
      industries,
      products
    };
  } catch (error) {
    console.error('Error in fetchFilterOptions:', error);
    return {
      owners: [],
      stages: [],
      industries: [],
      products: []
    };
  }
};

export const fetchDashboardData = async () => {
  try {
    // Fetch leads by stage
    const leadsByStageData = await fetchLeadsByStage();
    
    // Calculate total value
    const totalValue = leadsByStageData.reduce((sum, stage) => sum + stage.value, 0);
    
    // Fetch recent leads
    const recentLeads = await fetchLeads();
    
    // Fetch stages
    const stageData = await fetchLeadStages();
    
    return {
      leadsByStage: leadsByStageData.map(stage => ({
        name: stage.stageName,
        value: stage.count
      })),
      totalValue,
      recentLeads,
      stageData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const fetchLeads = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_stages (
          id,
          stage_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchLeads:', error);
    return [];
  }
};

export const fetchLeadStages = async () => {
  try {
    const { data, error } = await supabase
      .from('lead_stages')
      .select('*')
      .order('sequence', { ascending: true });
    
    if (error) {
      console.error('Error fetching lead stages:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchLeadStages:', error);
    return [];
  }
};

export const createLead = async (leadData: Omit<Lead, 'id' | 'lead_stages'>) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select();
    
    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
    
    return data?.[0];
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};
