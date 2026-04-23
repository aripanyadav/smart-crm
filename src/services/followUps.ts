import { supabase } from './supabase';

export type FollowUpStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface FollowUp {
  id: string;
  user_id: string;
  lead_id: string;
  due_date: string;
  status: FollowUpStatus;
  note: string;
  created_at: string;
  leads?: {
    id: string;
    contacts?: {
      name: string;
      company: string;
    }
  };
}

export interface FollowUpFormData {
  lead_id: string;
  due_date: string;
  note: string;
}

export const followUpService = {
  async createFollowUp(followUp: FollowUpFormData): Promise<FollowUp> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Validate that the lead belongs to the user is handled securely by RLS
    // but we can also rely on the DB throwing an error if it doesn't match

    const { data, error } = await supabase
      .from('follow_ups')
      .insert([{ 
        ...followUp, 
        user_id: userData.user.id,
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFollowUps(): Promise<FollowUp[]> {
    const { data, error } = await supabase
      .from('follow_ups')
      .select(`
        *,
        leads (
          id,
          contacts (
            name,
            company
          )
        )
      `)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateFollowUpStatus(id: string, status: FollowUpStatus): Promise<void> {
    const { error } = await supabase
      .from('follow_ups')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};
