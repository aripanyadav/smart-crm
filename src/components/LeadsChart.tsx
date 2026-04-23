import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Loader2, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  color: string;
  bgColor: string;
}

const STATUS_CONFIG: Record<string, { color: string, bgColor: string }> = {
  'New': { color: 'bg-slate-400', bgColor: 'bg-slate-400/10' },
  'Contacted': { color: 'bg-blue-500', bgColor: 'bg-blue-500/10' },
  'Interested': { color: 'bg-purple-500', bgColor: 'bg-purple-500/10' },
  'Converted': { color: 'bg-green-500', bgColor: 'bg-green-500/10' },
  'Lost': { color: 'bg-red-500', bgColor: 'bg-red-500/10' }
};

export default function LeadsChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    fetchLeadData();
  }, []);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: leads, error: fetchError } = await supabase
        .from('leads')
        .select('status');

      if (fetchError) throw fetchError;

      if (!leads || leads.length === 0) {
        setData([]);
        setTotalLeads(0);
        return;
      }

      setTotalLeads(leads.length);

      // Group by status
      const counts: Record<string, number> = {
        'New': 0,
        'Contacted': 0,
        'Interested': 0,
        'Converted': 0,
        'Lost': 0
      };
      
      leads.forEach((lead) => {
        const status = lead.status || 'New';
        if (counts.hasOwnProperty(status)) {
          counts[status]++;
        }
      });

      // Format for UI
      const chartData = Object.keys(counts).map((status) => ({
        name: status,
        value: counts[status],
        color: STATUS_CONFIG[status]?.color || 'bg-gray-400',
        bgColor: STATUS_CONFIG[status]?.bgColor || 'bg-gray-400/10'
      }));

      setData(chartData);
    } catch (err: any) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 w-full h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leads Conversion</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          <span>Real-time</span>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      ) : loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
          <p className="text-xs text-gray-400 animate-pulse">Analyzing leads...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
          No lead data to display yet
        </div>
      ) : (
        <div className="flex-1 space-y-6">
          {data.map((item) => {
            const percentage = totalLeads > 0 ? (item.value / totalLeads) * 100 : 0;
            return (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">({Math.round(percentage)}%)</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
             <span className="text-sm text-gray-500 dark:text-gray-400">Total Leads Processed</span>
             <span className="text-lg font-bold text-gray-900 dark:text-white">{totalLeads}</span>
          </div>
        </div>
      )}
    </div>
  );
}
