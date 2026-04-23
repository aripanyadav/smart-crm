import { supabase } from './supabase';

export type ActivityType = 'call' | 'meeting' | 'message';

export interface Activity {
  id: string;
  user_id: string;
  lead_id: string;
  type: ActivityType;
  note: string;
  created_at: string;
}

export interface ActivityFormData {
  lead_id: string;
  type: ActivityType;
  note: string;
}

export const activityService = {
  async createActivity(activity: ActivityFormData): Promise<Activity> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('activities')
      .insert([{ 
        ...activity, 
        user_id: userData.user.id 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getActivitiesByLead(leadId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
