
import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadContact, LeadInsert } from "@/types";

export const fetchLeads = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        profiles(name, email),
        lead_stages(*),
        lead_contacts(*)
      `)
      .order('created_at', { ascending: false });

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

export const fetchLeadById = async (id: number) => {
  try {
    console.log('Fetching lead with ID:', id);
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        profiles(name, email),
        lead_stages(*),
        lead_contacts(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }

    console.log('Lead data fetched:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchLeadById:', error);
    throw error;
  }
};

export const fetchLeadTeamMembers = async (leadId: number) => {
  try {
    const { data, error } = await supabase
      .from('lead_team')
      .select('*')
      .eq('lead_id', leadId);

    if (error) {
      console.error('Error fetching lead team members:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchLeadTeamMembers:', error);
    return [];
  }
};

export const createLead = async (lead: LeadInsert) => {
  try {
    // Sanitize the data before sending to the database
    const sanitizedLead = {
      ...lead,
      // Ensure stage_id is a valid number or null
      stage_id: lead.stage_id !== undefined && lead.stage_id !== null && !isNaN(Number(lead.stage_id)) 
        ? Number(lead.stage_id) 
        : null
    };
    
    console.log('Creating lead with data:', sanitizedLead);
    
    const { data, error } = await supabase
      .from('leads')
      .insert(sanitizedLead)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    console.log('Lead created:', data);
    return data;
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};

export const updateLead = async (id: number, updates: Partial<LeadInsert>) => {
  try {
    // Sanitize the data before sending to the database
    const sanitizedUpdates = {
      ...updates,
      // Ensure stage_id is a valid number or null
      stage_id: updates.stage_id !== undefined && updates.stage_id !== null && !isNaN(Number(updates.stage_id)) 
        ? Number(updates.stage_id) 
        : null
    };
    
    console.log('Updating lead with ID:', id, 'and data:', sanitizedUpdates);
    
    const { data, error } = await supabase
      .from('leads')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      throw error;
    }

    console.log('Lead updated:', data);
    return data;
  } catch (error) {
    console.error('Error in updateLead:', error);
    throw error;
  }
};

export const saveLeadContacts = async (leadId: number, contacts: Partial<LeadContact>[]) => {
  // First get existing contacts to determine which ones to update or delete
  const { data: existingContacts } = await supabase
    .from('lead_contacts')
    .select('*')
    .eq('lead_id', leadId);
  
  // Prepare batches for insert, update, delete
  const toInsert = contacts.filter(c => !c.id);
  const toUpdate = contacts.filter(c => c.id && existingContacts?.some(ec => ec.id === c.id));
  
  const existingIds = existingContacts?.map(c => c.id) || [];
  const newIds = contacts.filter(c => c.id).map(c => c.id);
  const toDelete = existingIds.filter(id => !newIds.includes(id as string));
  
  // Process batches
  const promises = [];
  
  if (toInsert.length > 0) {
    // Make sure all contacts have required fields
    const validContacts = toInsert.filter(c => c.name && c.name.trim() !== '');
    if (validContacts.length > 0) {
      const contactsWithLeadId = validContacts.map(c => ({ 
        ...c, 
        lead_id: leadId,
        name: c.name || 'Unknown' // Ensure name is always provided
      }));
      
      promises.push(
        supabase
          .from('lead_contacts')
          .insert(contactsWithLeadId)
      );
    }
  }
  
  for (const contact of toUpdate) {
    if (contact.id && (contact.name && contact.name.trim() !== '')) {
      promises.push(
        supabase
          .from('lead_contacts')
          .update({ 
            name: contact.name || 'Unknown', // Ensure name is always provided
            email: contact.email,
            phone: contact.phone,
            designation: contact.designation,
            updated_at: new Date().toISOString()
          })
          .eq('id', contact.id)
      );
    }
  }
  
  if (toDelete.length > 0) {
    promises.push(
      supabase
        .from('lead_contacts')
        .delete()
        .in('id', toDelete)
    );
  }
  
  await Promise.all(promises);
  
  // Return updated contacts
  const { data, error } = await supabase
    .from('lead_contacts')
    .select('*')
    .eq('lead_id', leadId);
    
  if (error) {
    throw error;
  }
  
  return data;
};

export const deleteLeadById = async (id: number) => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};

// New functions for user and team data
export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    return [];
  }
};

// Search function
export const globalSearch = async (searchTerm: string) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return { leads: [], users: [] };
  }

  try {
    // Search in leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        profiles(name, email),
        lead_stages(*)
      `)
      .or(`client_company.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%`)
      .limit(10);

    if (leadsError) {
      console.error('Error searching leads:', leadsError);
    }

    // Search in users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10);

    if (usersError) {
      console.error('Error searching users:', usersError);
    }

    return {
      leads: leadsData || [],
      users: usersData || []
    };
  } catch (error) {
    console.error('Error in globalSearch:', error);
    return { leads: [], users: [] };
  }
};
