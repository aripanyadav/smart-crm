import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Lead {
  id: string;
  contact: {
    name: string;
  };
}

interface AddActivityFormProps {
  onSuccess: () => void;
}

export default function AddActivityForm({ onSuccess }: AddActivityFormProps) {
  const [type, setType] = useState('call');
  const [note, setNote] = useState('');
  const [leadId, setLeadId] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select(`
          id,
          contact:contacts(name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLeads(data as any || []);
      if (data && data.length > 0) setLeadId(data[0].id);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      setError('Please select a lead');
      return;
    }
    if (!note.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('activities')
        .insert([{
          user_id: userData.user.id,
          lead_id: leadId,
          type,
          note
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setNote('');
      onSuccess();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error adding activity:', err);
      setError(err.message || 'Failed to add activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 w-full max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Activity</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Select Lead
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
              required
            >
              <option value="" disabled>Choose a lead...</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.contact?.name || 'Unknown Lead'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Activity Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
            >
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="message">Message</option>
              <option value="note">Note</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened? (e.g., Talked about pricing...)"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white min-h-[100px] resize-none"
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-xl text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Activity added successfully!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !leadId}
          className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Activity'
          )}
        </button>
      </form>
    </div>
  );
}
