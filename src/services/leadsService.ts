
import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadContact, LeadInsert } from "@/types";

export const fetchLeads = async () => {
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
};

export const fetchLeadById = async (id: number) => {
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

  return data;
};

export const createLead = async (lead: LeadInsert) => {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  return data;
};

export const updateLead = async (id: number, updates: Partial<LeadInsert>) => {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    throw error;
  }

  return data;
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
    const validContacts = toInsert.filter(c => c.name);
    if (validContacts.length > 0) {
      promises.push(
        supabase
          .from('lead_contacts')
          .insert(validContacts.map(c => ({ ...c, lead_id: leadId })))
      );
    }
  }
  
  toUpdate.forEach(contact => {
    if (contact.name) {
      promises.push(
        supabase
          .from('lead_contacts')
          .update({ 
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            designation: contact.designation,
            updated_at: new Date().toISOString()
          })
          .eq('id', contact.id)
      );
    }
  });
  
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

// Search function
export const globalSearch = async (searchTerm: string) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return { leads: [], users: [] };
  }

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
};
