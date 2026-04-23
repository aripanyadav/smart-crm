import { useState, useEffect } from 'react';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { leadsService } from '../services/leads';
import type { Lead, LeadStatus } from '../services/leads';
import { Loader2, AlertCircle, Target } from 'lucide-react';
import KanbanColumn from '../components/KanbanColumn';
import SortableLeadCard from '../components/SortableLeadCard';
import { useToast } from '../contexts/ToastContext';

const COLUMNS: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Converted', 'Lost'];

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    
    const leadToUpdate = leads.find(l => l.id === leadId);
    if (!leadToUpdate) return;

    // Determine target status (over could be a column ID or another card's ID)
    let targetStatus: LeadStatus | null = null;
    if (COLUMNS.includes(newStatus)) {
      targetStatus = newStatus;
    } else {
      const overLead = leads.find(l => l.id === over.id);
      if (overLead) targetStatus = overLead.status;
    }

    if (!targetStatus || leadToUpdate.status === targetStatus) return;

    const previousLeads = [...leads];
    
    try {
      setIsUpdating(true);
      
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, status: targetStatus as LeadStatus } : l
      ));

      await leadsService.updateLeadStatus(leadId, targetStatus);
      toast(`Lead moved to ${targetStatus}`, 'success');
    } catch (err: any) {
      setLeads(previousLeads);
      toast(`Failed to move lead: ${err.message}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag and drop leads to update their status</p>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full animate-pulse transition-all">
            <Loader2 className="w-3 h-3 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start shrink-0 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-md w-full">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your pipeline is empty</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Create some leads to see them organized in the pipeline board.
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-6 h-full min-w-max px-1">
              {COLUMNS.map(status => (
                <KanbanColumn 
                  key={status} 
                  status={status} 
                  leads={getLeadsByStatus(status)} 
                  disabled={isUpdating}
                />
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeLead ? (
              <div className="rotate-2 scale-105 shadow-2xl transition-transform duration-200 cursor-grabbing w-80 pointer-events-none">
                <SortableLeadCard lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
