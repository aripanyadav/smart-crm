import { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, XOctagon, AlertCircle, 
  Calendar, Flame, Wallet, Plus, FileText, 
  CheckCircle2, Clock, ArrowRight, UserPlus, Receipt
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { leadsService } from '../services/leads';
import { followUpService } from '../services/followUps';
import type { FollowUp } from '../services/followUps';
import { aiLeadsService } from '../services/aiLeads';
import type { LeadScoreResult } from '../services/aiLeads';
import { transactionService } from '../services/transactions';
import type { Transaction } from '../services/transactions';
import type { Lead } from '../services/leads';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';

import DemoWorkspaceButton from '../components/DemoWorkspaceButton';

interface DashboardMetrics {
  totalLeads: number;
  convertedLeads: number;
  lostLeads: number;
  totalValue: number;
}

interface HotLead extends Lead {
  aiScore: LeadScoreResult;
}

export default function Dashboard() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey] = useState(0);

  const todayStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, allFollowUps, allLeads, allTransactions] = await Promise.all([
          leadsService.getDashboardMetrics(),
          followUpService.getFollowUps(),
          leadsService.getLeads(),
          transactionService.getTransactions()
        ]);

        setMetrics(metricsData);

        // Process Follow-ups (Pending, nearest date)
        const pendingFollowUps = allFollowUps
          .filter(f => f.status === 'Pending')
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          .slice(0, 4);
        setFollowUps(pendingFollowUps);

        // Process Hot Leads (AI Heuristic Scoring)
        const scoredLeads = allLeads.map(lead => ({
          ...lead,
          aiScore: aiLeadsService.calculateHeuristicScore(lead)
        }));
        
        const topHotLeads = scoredLeads
          .filter(l => l.status !== 'Converted' && l.status !== 'Lost')
          .sort((a, b) => b.aiScore.score - a.aiScore.score)
          .slice(0, 3);
        setHotLeads(topHotLeads);

        // Process Transactions (Recent)
        setTransactions(allTransactions.slice(0, 3));

      } catch (err: any) {
        console.error('Workspace fetch error:', err);
        setError(err.message || 'Failed to load workspace data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [refreshKey]);



  const getScoreColor = (category: string) => {
    switch (category) {
      case 'High': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 bg-white dark:bg-gray-800 rounded-2xl lg:col-span-2" />
        <div className="h-96 bg-white dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Today Summary Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
            <Calendar className="w-4 h-4" />
            <span className="uppercase tracking-wider">{todayStr}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.name || 'User'} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what needs your attention today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoWorkspaceButton />
          <button 
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? renderSkeletons() : (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: metrics?.totalLeads || 0, icon: Target, color: 'text-blue-500' },
              { label: 'Converted', value: metrics?.convertedLeads || 0, icon: TrendingUp, color: 'text-green-500' },
              { label: 'Lost', value: metrics?.lostLeads || 0, icon: XOctagon, color: 'text-red-500' },
              { label: 'Pipeline Value', value: formatCurrency(metrics?.totalValue || 0, profile?.currency), icon: Wallet, color: 'text-primary' },
            ].map((metric, idx) => (
              <div key={idx} className="bg-white dark:bg-[#12141a]/60 p-5 rounded-2xl border border-gray-200/70 dark:border-gray-800/40 shadow-premium dark:shadow-premium-dark flex flex-col justify-between hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{metric.label}</span>
                  <metric.icon className={`w-5 h-5 ${metric.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white truncate">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {metrics?.totalLeads === 0 && !error && (
            <div className="my-8 p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to your Workspace!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                Your daily workspace is currently empty. Start tracking your pipeline by adding your first lead, or load our demo workspace to see how everything works.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/leads')}
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  Add First Lead
                </button>
                <DemoWorkspaceButton />
              </div>
            </div>
          )}

          {/* Main Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Follow-ups & Hot Leads */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Today's Follow-ups */}
              <div className="bg-white dark:bg-[#12141a]/60 rounded-3xl p-6 border border-gray-200/70 dark:border-gray-800/40 shadow-premium dark:shadow-premium-dark backdrop-blur-md flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Action Items</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Your upcoming follow-ups</p>
                    </div>
                  </div>
                  <Link to="/tasks" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 active:scale-95 transition-transform">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {followUps.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">You're all caught up!</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">No pending follow-ups right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followUps.map(task => (
                      <div key={task.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/80 dark:bg-[#08090c]/40 border border-gray-200/70 dark:border-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            Follow up with {task.leads?.contacts?.name || 'Lead'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{task.note}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                            {task.leads?.contacts?.company && (
                              <span className="text-[10px] font-medium text-gray-400 truncate">
                                {task.leads.contacts.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hot Leads */}
              <div className="bg-white dark:bg-[#12141a]/60 rounded-3xl p-6 border border-gray-200/70 dark:border-gray-800/40 shadow-premium dark:shadow-premium-dark backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hot Leads</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">AI-prioritized opportunities</p>
                    </div>
                  </div>
                  <Link to="/pipeline" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 active:scale-95 transition-transform">
                    Pipeline <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {hotLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No active leads</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Add some leads to see them prioritized here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {hotLeads.map(lead => (
                      <div key={lead.id} className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#08090c]/40 border border-gray-200/70 dark:border-gray-800/30 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${getScoreColor(lead.aiScore.category)}`}>
                            {lead.aiScore.category} Priority
                          </span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {lead.aiScore.score}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white truncate mb-1">
                          {lead.contacts?.name || 'Unknown Contact'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3">
                          {lead.contacts?.company || lead.status}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(lead.value, profile?.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Transactions & Quick Actions */}
            <div className="flex flex-col gap-6">
              
              {/* Financial & Transactions */}
              <div className="bg-white dark:bg-[#12141a]/60 rounded-3xl p-6 border border-gray-200/70 dark:border-gray-800/40 shadow-premium dark:shadow-premium-dark backdrop-blur-md flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financials</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recent & pending</p>
                  </div>
                </div>

                {/* Pending Invoices / Payments Dummy Block */}
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 mb-6 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center text-green-600 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-850 dark:text-green-350">All Clear</p>
                    <p className="text-xs text-green-600 dark:text-green-400">0 Pending Payments</p>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Recent Activity</h3>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No recent transactions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === 'income' 
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400' 
                              : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {tx.type === 'income' ? <Plus className="w-3 h-3" /> : <div className="w-3 h-0.5 bg-current" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {tx.type === 'income' ? tx.from_entity : tx.to_entity}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {new Date(tx.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${
                          tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, profile?.currency)}
                        </span>
                      </div>
                    ))}
                    <Link to="/transactions" className="block text-center text-xs font-bold text-primary hover:text-primary-dark pt-2 active:scale-95 transition-transform">
                      View All Transactions
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-primary/5 dark:bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate('/contacts')}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-gray-200/70 dark:border-gray-800/40 hover:-translate-y-0.5 active:translate-y-0 hover:border-primary/40 hover:shadow-premium dark:hover:shadow-premium-dark text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all duration-200 btn-premium active:scale-95"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="text-xs font-bold">Contact</span>
                  </button>
                  <button 
                    onClick={() => navigate('/leads')}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-gray-200/70 dark:border-gray-800/40 hover:-translate-y-0.5 active:translate-y-0 hover:border-primary/40 hover:shadow-premium dark:hover:shadow-premium-dark text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all duration-200 btn-premium active:scale-95"
                  >
                    <Target className="w-5 h-5" />
                    <span className="text-xs font-bold">Lead</span>
                  </button>
                  <button 
                    onClick={() => navigate('/invoices')}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-gray-200/70 dark:border-gray-800/40 hover:-translate-y-0.5 active:translate-y-0 hover:border-primary/40 hover:shadow-premium dark:hover:shadow-premium-dark text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all duration-200 btn-premium active:scale-95"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-bold">Invoice</span>
                  </button>
                  <button 
                    onClick={() => navigate('/transactions')}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-gray-200/70 dark:border-gray-800/40 hover:-translate-y-0.5 active:translate-y-0 hover:border-primary/40 hover:shadow-premium dark:hover:shadow-premium-dark text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all duration-200 btn-premium active:scale-95"
                  >
                    <Receipt className="w-5 h-5" />
                    <span className="text-xs font-bold">Payment</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
