import { supabase } from './supabase';

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Lost';

export interface Lead {
  id: string;
  user_id: string;
  contact_id: string;
  status: LeadStatus;
  value: number;
  created_at: string;
  contacts?: {
    name: string;
    company: string | null;
  };
}

export type LeadFormData = Omit<Lead, 'id' | 'user_id' | 'created_at' | 'contacts'>;

export const leadsService = {
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*, contacts(name, company)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createLead(lead: LeadFormData): Promise<Lead> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...lead, user_id: userData.user.id }])
      .select('*, contacts(name, company)')
      .single();

    if (error) throw error;
    return data;
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  async getDashboardMetrics() {
    // Only fetch necessary fields to keep the query highly efficient
    const { data, error } = await supabase
      .from('leads')
      .select('status, value');

    if (error) throw error;

    const metrics = {
      totalLeads: 0,
      convertedLeads: 0,
      lostLeads: 0,
      totalValue: 0
    };

    if (data) {
      metrics.totalLeads = data.length;
      data.forEach(lead => {
        if (lead.status === 'Converted') metrics.convertedLeads++;
        if (lead.status === 'Lost') metrics.lostLeads++;
        metrics.totalValue += Number(lead.value || 0);
      });
    }

    return metrics;
  }
};
