import { useState, useEffect } from 'react';
import { Target, TrendingUp, XOctagon, AlertCircle } from 'lucide-react';
import { leadsService } from '../services/leads';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';
import ActivityTimeline from '../components/ActivityTimeline';
import AddActivityForm from '../components/AddActivityForm';
import LeadsChart from '../components/LeadsChart';

interface DashboardMetrics {
  totalLeads: number;
  convertedLeads: number;
  lostLeads: number;
  totalValue: number;
}

export default function Dashboard() {
  const { profile } = useProfile();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await leadsService.getDashboardMetrics();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your business</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Target className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 relative z-10">Total Leads</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white relative z-10">{metrics.totalLeads}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 relative z-10">Converted Leads</h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400 relative z-10">{metrics.convertedLeads}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <XOctagon className="w-16 h-16 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 relative z-10">Lost Leads</h3>
            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400 relative z-10">{metrics.lostLeads}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Target className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 relative z-10">Total Value</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white relative z-10">
              {formatCurrency(metrics.totalValue, profile?.currency)}
            </p>
          </div>
        </div>
      ) : null}
      
      {!loading && metrics && metrics.totalLeads === 0 && !error && (
        <div className="mt-8 text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Your dashboard is looking a little empty.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start adding leads to see your metrics grow!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <LeadsChart />
        </div>
        <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/10 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Performance Insight</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your conversion rate is looking healthy. Focus on "Interested" leads to boost your "Converted" count this week.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 items-start">
        <div className="space-y-6">
          <AddActivityForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
        </div>
        <div>
          <ActivityTimeline refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
