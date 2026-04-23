import { supabase } from './supabase';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'user_id' | 'created_at'>;

export const contactsService = {
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createContact(contact: ContactFormData): Promise<Contact> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...contact, user_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateContact(id: string, contact: ContactFormData): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
