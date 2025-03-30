
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

export const fetchLeadById = async (id: string) => {
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

export const updateLead = async (id: string, updates: Partial<Lead>) => {
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
    promises.push(
      supabase
        .from('lead_contacts')
        .insert(toInsert.map(c => ({ ...c, lead_id: leadId })))
    );
  }
  
  toUpdate.forEach(contact => {
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

export const deleteLeadById = async (id: string) => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};
