import { useState, useEffect } from 'react';
import {
  BookOpen, Search, Plus, ArrowUpRight,
  ArrowDownLeft, Phone, User, Loader2, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { khataService } from '../services/khataService';
import type { KhataSummary } from '../services/khataService';
import { formatCurrency } from '../utils/formatters';
import { useProfile } from '../contexts/ProfileContext';

export default function KhataBook() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<KhataSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'clear'>('all');

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const data = await khataService.getKhataSummaries();
      setSummaries(data);
    } catch (error) {
      console.error('Failed to fetch khata summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSummaries = summaries.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));

    if (filterType === 'due') return matchesSearch && s.balance > 0;
    if (filterType === 'clear') return matchesSearch && s.balance <= 0;
    return matchesSearch;
  });

  const totals = summaries.reduce((acc, curr) => ({
    credit: acc.credit + curr.total_credit,
    paid: acc.paid + curr.total_paid,
    balance: acc.balance + curr.balance
  }), { credit: 0, paid: 0, balance: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Khata Book</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Digital Udhar tracking for your customers</p>
        </div>
        <button
          onClick={() => navigate('/contacts')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Udhar Given</span>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <ArrowUpRight className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(totals.credit, profile?.currency)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Received</span>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ArrowDownLeft className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(totals.paid, profile?.currency)}
          </div>
        </div>

        <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-80">Remaining Balance</span>
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black">
            {formatCurrency(totals.balance, profile?.currency)}
          </div>
        </div>
      </div>

      {/* Filters & List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'due', 'clear'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filterType === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {filteredSummaries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No customers found with khata records.</p>
            </div>
          ) : (
            filteredSummaries.map((s) => (
              <Link
                key={s.contact_id}
                to={`/khata/${s.contact_id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{s.name}</h3>
                    {s.phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {s.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Remaining</div>
                    <div className={`font-black ${s.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(s.balance, profile?.currency)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
