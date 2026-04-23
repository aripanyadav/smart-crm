import { supabase } from './supabase';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  currency: string;
  created_at: string;
}

export const profileService = {
  async getProfile(): Promise<Profile> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // PGRST116: No rows found (profile needs creation)
      if (error.code === 'PGRST116') {
        const newProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          currency: 'USD'
        };
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          throw new Error('Failed to create user profile. Please check database permissions.');
        }
        return created;
      }
      
      // If table is missing, provide a clear error message
      if (error.message?.includes('profiles') && error.message?.includes('schema cache')) {
        throw new Error('Database table "profiles" is missing. Please run the SQL setup script in Supabase.');
      }

      throw error;
    }
    return data;
  },

  async updateProfile(profile: Partial<Profile>): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);

    if (error) throw error;
  },

  async deleteAccount(): Promise<void> {
    const { error } = await supabase.rpc('delete_user_account');
    if (error) throw error;
    
    // Sign out after deletion
    await supabase.auth.signOut();
  }
};
