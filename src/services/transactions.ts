import { supabase } from './supabase';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  from_entity: string;
  to_entity: string;
  notes?: string;
  created_at: string;
}

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }]);

    if (error) throw error;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
