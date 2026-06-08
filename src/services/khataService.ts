import { supabase } from './supabase';

export type KhataEntryType = 'credit' | 'payment';

export interface KhataEntry {
  id: string;
  user_id: string;
  contact_id: string;
  type: KhataEntryType;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface KhataSummary {
  contact_id: string;
  name: string;
  phone: string | null;
  total_credit: number;
  total_paid: number;
  balance: number;
}

export const khataService = {
  async getKhataSummaries(): Promise<KhataSummary[]> {
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, phone');

    if (contactsError) throw contactsError;

    const { data: entries, error: entriesError } = await supabase
      .from('khata_entries')
      .select('contact_id, type, amount');

    if (entriesError) throw entriesError;

    // Calculate summaries manually for better control
    const summaries: Record<string, KhataSummary> = {};

    contacts.forEach(c => {
      summaries[c.id] = {
        contact_id: c.id,
        name: c.name,
        phone: c.phone,
        total_credit: 0,
        total_paid: 0,
        balance: 0
      };
    });

    entries?.forEach(e => {
      if (summaries[e.contact_id]) {
        if (e.type === 'credit') {
          summaries[e.contact_id].total_credit += Number(e.amount);
        } else {
          summaries[e.contact_id].total_paid += Number(e.amount);
        }
      }
    });

    Object.values(summaries).forEach(s => {
      s.balance = s.total_credit - s.total_paid;
    });

    // Filter out contacts with no khata history if needed, 
    // but for "Khata Book" we might want to show everyone to encourage adding.
    return Object.values(summaries).sort((a, b) => b.balance - a.balance);
  },

  async getKhataEntries(contactId: string): Promise<KhataEntry[]> {
    const { data, error } = await supabase
      .from('khata_entries')
      .select('*')
      .eq('contact_id', contactId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addKhataEntry(entry: Omit<KhataEntry, 'id' | 'user_id' | 'created_at'>): Promise<KhataEntry> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('khata_entries')
      .insert([{ ...entry, user_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteKhataEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('khata_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
