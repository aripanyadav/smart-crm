import { useState, useEffect } from 'react';
import { aiLeadsService } from '../services/aiLeads';
import type { LeadScoreResult } from '../services/aiLeads';
import { Sparkles, TrendingUp } from 'lucide-react';

interface LeadScoreProps {
  leadId: string;
}

export default function LeadScore({ leadId }: LeadScoreProps) {
  const [result, setResult] = useState<LeadScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getScore() {
      const scoreResult = await aiLeadsService.calculateLeadScore(leadId);
      setResult(scoreResult);
      setLoading(false);
    }
    getScore();
  }, [leadId]);

  if (loading) {
    return <div className="h-4 w-12 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-full" />;
  }

  if (!result) return null;

  const colors = {
    High: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    Low: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  };

  return (
    <div className="flex items-center gap-1.5 group/score relative">
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[result.category]} transition-all hover:scale-105`}>
        <Sparkles className="w-2.5 h-2.5" />
        {result.score}
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/score:block z-50 w-32">
        <div className="bg-gray-900 text-white text-[9px] p-2 rounded-lg shadow-xl border border-gray-700">
          <p className="font-bold flex items-center gap-1 mb-1">
            <TrendingUp className="w-2 h-2 text-primary" />
            AI Insight
          </p>
          <p className="opacity-80">{result.reason}</p>
        </div>
        <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1 border-r border-b border-gray-700" />
      </div>
    </div>
  );
}
