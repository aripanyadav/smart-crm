import { useState, useEffect } from 'react';
import { X, Calendar, FileText, Target, Loader2, AlertCircle } from 'lucide-react';
import { followUpService } from '../services/followUps';
import { leadsService } from '../services/leads';
import type { Lead } from '../services/leads';
import { useToast } from '../contexts/ToastContext';

interface FollowUpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLeadId?: string;
}

export default function FollowUpFormModal({ isOpen, onClose, onSuccess, initialLeadId }: FollowUpFormModalProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [formData, setFormData] = useState({
    lead_id: initialLeadId || '',
    due_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchLeads = async () => {
        try {
          setLoadingLeads(true);
          const data = await leadsService.getLeads();
          setLeads(data);
          if (data.length > 0 && !formData.lead_id && !initialLeadId) {
            setFormData(prev => ({ ...prev, lead_id: data[0].id }));
          }
        } catch (err: any) {
          setError('Failed to load leads for selection');
        } finally {
          setLoadingLeads(false);
        }
      };
      fetchLeads();
    }
  }, [isOpen, initialLeadId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_id) {
      setError('Please select a lead');
      return;
    }
    if (!formData.due_date) {
      setError('Please set a due date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await followUpService.createFollowUp({
        ...formData,
        // Convert local datetime-local to ISO string for DB
        due_date: new Date(formData.due_date).toISOString()
      });
      toast('Task created successfully', 'success');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        lead_id: '',
        due_date: new Date().toISOString().slice(0, 16),
        note: ''
      });
    } catch (err: any) {
      const msg = err.message || 'Failed to create follow-up task';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Related Lead *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                required
                disabled={loadingLeads}
                value={formData.lead_id}
                onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white appearance-none"
              >
                {loadingLeads ? (
                  <option>Loading leads...</option>
                ) : leads.length === 0 ? (
                  <option value="">No leads available</option>
                ) : (
                  <>
                    <option value="" disabled>Select a lead</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.contacts?.name} ({lead.status})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date & Time *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Note *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                required
                placeholder="What needs to be done?"
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!formData.lead_id && leads.length === 0)}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
