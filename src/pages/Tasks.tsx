import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Calendar, Clock, Building, User, Loader2, AlertCircle } from 'lucide-react';
import FollowUpFormModal from '../components/FollowUpFormModal';
import { followUpService } from '../services/followUps';
import type { FollowUp, FollowUpStatus } from '../services/followUps';
import { useToast } from '../contexts/ToastContext';

export default function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await followUpService.getFollowUps();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: FollowUpStatus) => {
    const targetTaskIndex = tasks.findIndex(t => t.id === taskId);
    if (targetTaskIndex === -1) return;

    const previousStatus = tasks[targetTaskIndex].status;
    if (previousStatus === newStatus) return;

    try {
      setUpdatingId(taskId);
      
      // Optimistic update
      const updatedTasks = [...tasks];
      updatedTasks[targetTaskIndex] = { ...updatedTasks[targetTaskIndex], status: newStatus };
      setTasks(updatedTasks);

      await followUpService.updateFollowUpStatus(taskId, newStatus);
      toast('Task updated', 'success');
    } catch (err: any) {
      // Rollback
      const revertedTasks = [...tasks];
      revertedTasks[targetTaskIndex] = { ...revertedTasks[targetTaskIndex], status: previousStatus };
      setTasks(revertedTasks);
      toast(`Failed to update task: ${err.message}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: FollowUpStatus) => {
    switch (status) {
      case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'Cancelled': return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks & Follow-ups</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your upcoming follow-ups and action items</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-3 w-full max-w-md">
                  <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                </div>
                <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No upcoming tasks</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            You don't have any tasks right now. Create a task to follow up on your leads.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create a Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => {
            const isUpdating = updatingId === task.id;
            const { date, time } = formatDateTime(task.due_date);
            const contactName = task.leads?.contacts?.name || 'Unknown Contact';
            const company = task.leads?.contacts?.company;

            return (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-primary/5 rounded-lg">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{contactName}</h3>
                        {company && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {company}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm pl-11">
                      {task.note}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pl-11">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="relative inline-block w-32">
                      {isUpdating && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                        </div>
                      )}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as FollowUpStatus)}
                        disabled={isUpdating}
                        className={`w-full appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${getStatusColor(task.status)} ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FollowUpFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
