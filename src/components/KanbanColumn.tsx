import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lead, LeadStatus } from '../services/leads';
import SortableLeadCard from './SortableLeadCard';

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  disabled?: boolean;
}

export default function KanbanColumn({ status, leads, disabled }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status
    }
  });

  const getColumnColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'border-t-blue-500';
      case 'Contacted': return 'border-t-yellow-500';
      case 'Interested': return 'border-t-purple-500';
      case 'Converted': return 'border-t-green-500';
      case 'Lost': return 'border-t-red-500';
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`w-80 flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border transition-all duration-200 ${
        isOver ? 'border-primary ring-2 ring-primary/20 bg-primary/5 scale-[1.01]' : 'border-gray-100 dark:border-gray-800'
      }`}
    >
      <div className={`p-4 border-t-4 rounded-t-2xl bg-white dark:bg-gray-800 flex justify-between items-center shadow-sm ${getColumnColor(status)}`}>
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          {status}
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-[10px]">
            {leads.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.length === 0 ? (
            <div className="h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Drop here</p>
            </div>
          ) : (
            leads.map(lead => (
              <SortableLeadCard key={lead.id} lead={lead} disabled={disabled} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
