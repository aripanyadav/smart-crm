import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building } from 'lucide-react';
import type { Lead } from '../services/leads';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';

import LeadScore from './LeadScore';

interface SortableLeadCardProps {
  lead: Lead;
  disabled?: boolean;
}

export default function SortableLeadCard({ lead, disabled }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: lead.id,
    disabled: disabled,
    data: {
      type: 'Lead',
      lead
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const { profile } = useProfile();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group ${
        disabled ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors truncate">
              {lead.contacts?.name || 'Unknown'}
            </h4>
            {lead.contacts?.company && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 truncate">
                <Building className="w-3 h-3 shrink-0" />
                {lead.contacts.company}
              </div>
            )}
          </div>
          <div className="shrink-0">
            <LeadScore leadId={lead.id} />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-700/50">
          <div className="flex items-center text-gray-900 dark:text-white font-bold text-xs">
            {formatCurrency(lead.value, profile?.currency)}
          </div>
          <div className="text-[10px] text-gray-400 font-medium">
            {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
