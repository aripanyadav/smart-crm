import { useState, useEffect } from 'react';
import { Plus, Target, Building, Calendar, Loader2, AlertCircle, History } from 'lucide-react';
import LeadFormModal from '../components/LeadFormModal';
import LeadActivitiesModal from '../components/LeadActivitiesModal';
import { leadsService } from '../services/leads';
import type { Lead, LeadStatus } from '../services/leads';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Converted', 'Lost'];

export default function Leads() {
  const { profile } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState<{id: string, name: string} | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    // Find the original lead to allow rollback if the API fails
    const targetLeadIndex = leads.findIndex(l => l.id === leadId);
    if (targetLeadIndex === -1) return;
    
    const previousStatus = leads[targetLeadIndex].status;
    
    // Prevent redundant updates
    if (previousStatus === newStatus) return;

    try {
      setUpdatingId(leadId);
      setError(null); // Clear global errors before specific action

      // 1. Optimistic Update
      const updatedLeads = [...leads];
      updatedLeads[targetLeadIndex] = { ...updatedLeads[targetLeadIndex], status: newStatus };
      setLeads(updatedLeads);

      // 2. Perform actual API call
      await leadsService.updateLeadStatus(leadId, newStatus);
      toast(`Status updated for ${leads[targetLeadIndex].contacts?.name || 'lead'}`, 'success');
    } catch (err: any) {
      // 3. Rollback UI on failure
      const revertedLeads = [...leads];
      revertedLeads[targetLeadIndex] = { ...revertedLeads[targetLeadIndex], status: previousStatus };
      setLeads(revertedLeads);
      
      // 4. Show error feedback
      toast(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Contacted': return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'Interested': return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'Converted': return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Lost': return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your sales pipeline</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Value</th>
                  <th className="p-4 font-medium text-center">Timeline</th>
                  <th className="p-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="p-4">
                      <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-28 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="p-4 text-center">
                      <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mx-auto" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add your first lead to get started 🚀</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Track your sales pipeline, log activities, and grow your business with Nowworks AI.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Create Lead
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Value</th>
                  <th className="p-4 font-medium text-center">Timeline</th>
                  <th className="p-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {leads.map((lead) => {
                  const isUpdating = updatingId === lead.id;
                  const leadName = lead.contacts?.name || 'Unknown Contact';
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {leadName}
                        </div>
                        {lead.contacts?.company && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3" />
                            {lead.contacts.company}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="relative inline-block w-36">
                          {isUpdating && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                            </div>
                          )}
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            disabled={isUpdating}
                            className={`w-full appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${getStatusColor(lead.status)} ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status} value={status} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white font-normal">
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(lead.value, profile?.currency)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedLeadForTimeline({ id: lead.id, name: leadName })}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="View Activity Timeline"
                        >
                          <History className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLeads}
      />

      <LeadActivitiesModal
        isOpen={!!selectedLeadForTimeline}
        onClose={() => setSelectedLeadForTimeline(null)}
        leadId={selectedLeadForTimeline?.id || ''}
        leadName={selectedLeadForTimeline?.name || ''}
      />
    </div>
  );
}
