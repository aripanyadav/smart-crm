import { useState, useEffect } from 'react';
import { 
  Plus, ArrowUpCircle, ArrowDownCircle, Wallet, 
  Search, Filter, Download, Trash2, Loader2, 
  AlertCircle, FileText, Calendar, User, UserPlus, DollarSign
} from 'lucide-react';
import { transactionService } from '../services/transactions';
import type { Transaction } from '../services/transactions';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Transactions() {
  const { profile } = useProfile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromEntity, setFromEntity] = useState('');
  const [toEntity, setToEntity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions. Please ensure the "transactions" table exists in your database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await transactionService.addTransaction({
        type,
        amount: parseFloat(amount),
        date,
        from_entity: fromEntity,
        to_entity: toEntity,
        notes
      });
      setShowForm(false);
      resetForm();
      fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setType('income');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setFromEntity('');
    setToEntity('');
    setNotes('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionService.deleteTransaction(id);
      fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    }
  };

  const calculateSummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = 
      t.from_entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.to_entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    const summary = calculateSummary();

    doc.setFontSize(20);
    doc.text('Payment & Transactions Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Summary Box
    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.rect(14, 35, 182, 20, 'F');
    doc.setTextColor(0);
    doc.text(`Total Income: ${formatCurrency(summary.income, profile?.currency)}`, 20, 47);
    doc.text(`Total Expenses: ${formatCurrency(summary.expenses, profile?.currency)}`, 80, 47);
    doc.text(`Current Balance: ${formatCurrency(summary.balance, profile?.currency)}`, 140, 47);

    const tableData = filteredTransactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      t.from_entity,
      t.to_entity,
      formatCurrency(t.amount, profile?.currency)
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Type', 'From', 'To', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save('transactions_report.pdf');
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your income, expenses and cash flow</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase">Total Income</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(summary.income, profile?.currency)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase">Total Expenses</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(summary.expenses, profile?.currency)}
          </p>
        </div>

        <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white/60 uppercase">Net Balance</span>
          </div>
          <p className="text-2xl font-black">
            {formatCurrency(summary.balance, profile?.currency)}
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}
                >
                  Income
                </button>
                <button 
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> Amount
              </label>
              <input 
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" /> From (Sender)
              </label>
              <input 
                type="text"
                required
                value={fromEntity}
                onChange={(e) => setFromEntity(e.target.value)}
                placeholder="e.g. Client Name"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-3 h-3" /> To (Receiver)
              </label>
              <input 
                type="text"
                required
                value={toEntity}
                onChange={(e) => setToEntity(e.target.value)}
                placeholder="e.g. My Company"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3 h-3" /> Notes
              </label>
              <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief description..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-8 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by sender, receiver or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 md:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
          {(filterType !== 'all' || searchQuery !== '') && (
            <button 
              onClick={() => {
                setFilterType('all');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" /></td>
                    <td className="px-6 py-4 flex justify-end"><div className="h-4 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <p className="text-gray-900 dark:text-white font-bold text-lg">Oops! Something went wrong</p>
              <p className="text-gray-500 text-sm mt-2">{error}</p>
            </div>
            <button 
              onClick={fetchTransactions}
              className="mt-4 px-6 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No transactions yet</h3>
            <p className="text-gray-500 max-w-md">Record your first income or expense to start tracking your cash flow with Nowworks.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {t.from_entity} → {t.to_entity}
                      </div>
                      {t.notes && <div className="text-xs text-gray-400 mt-1">{t.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                        t.type === 'income' 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                      }`}>
                        {t.type === 'income' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-black text-right whitespace-nowrap ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, profile?.currency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
