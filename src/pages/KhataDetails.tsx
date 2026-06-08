import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, Trash2, Calendar, 
  StickyNote, Wallet, ArrowUpRight, ArrowDownLeft, Loader2
} from 'lucide-react';
import { khataService } from '../services/khataService';
import type { KhataEntry } from '../services/khataService';
import { contactsService } from '../services/contacts';
import type { Contact } from '../services/contacts';
import { formatCurrency } from '../utils/formatters';
import { useProfile } from '../contexts/ProfileContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function KhataDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'payment'>('credit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [contactData, entriesData] = await Promise.all([
        contactsService.getContacts().then(all => all.find(c => c.id === id) || null),
        khataService.getKhataEntries(id)
      ]);
      setContact(contactData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Failed to fetch khata details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !amount) return;
    
    setSubmitting(true);
    try {
      await khataService.addKhataEntry({
        contact_id: id,
        type,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        note: note || null
      });
      setAmount('');
      setNote('');
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add khata entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await khataService.deleteKhataEntry(entryId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete khata entry:', error);
    }
  };

  const exportPDF = () => {
    if (!contact) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('Customer Khata Statement', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Customer: ${contact.name}`, 14, 30);
    doc.text(`Phone: ${contact.phone || 'N/A'}`, 14, 37);
    doc.text(`Company: ${contact.company || 'N/A'}`, 14, 44);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 51);

    const summary = entries.reduce((acc, curr) => {
      if (curr.type === 'credit') acc.credit += curr.amount;
      else acc.paid += curr.amount;
      return acc;
    }, { credit: 0, paid: 0 });

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Summary:`, 14, 65);
    doc.text(`Total Udhar: ${formatCurrency(summary.credit, profile?.currency)}`, 14, 75);
    doc.text(`Total Paid: ${formatCurrency(summary.paid, profile?.currency)}`, 14, 82);
    doc.text(`Balance Due: ${formatCurrency(summary.credit - summary.paid, profile?.currency)}`, 14, 89);

    const tableData = entries.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.type === 'credit' ? 'Udhar Given' : 'Payment Received',
      formatCurrency(e.amount, profile?.currency),
      e.note || '-'
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['Date', 'Type', 'Amount', 'Note']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`${contact.name}_Khata_Statement.pdf`);
  };

  const summary = entries.reduce((acc, curr) => {
    if (curr.type === 'credit') acc.credit += curr.amount;
    else acc.paid += curr.amount;
    return acc;
  }, { credit: 0, paid: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contact) {
    return <div className="p-8 text-center text-gray-500">Customer not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/khata')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Khata Book
        </button>
        <button 
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black">
          {contact.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{contact.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{contact.phone || 'No phone added'} • {contact.company || 'Personal'}</p>
        
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50 dark:border-gray-700">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Udhar</div>
            <div className="text-xl font-black text-red-600">{formatCurrency(summary.credit, profile?.currency)}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</div>
            <div className="text-xl font-black text-green-600">{formatCurrency(summary.paid, profile?.currency)}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Balance</div>
            <div className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(summary.credit - summary.paid, profile?.currency)}</div>
          </div>
        </div>
      </div>

      {/* Add Entry Section */}
      {!showForm ? (
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => { setType('credit'); setShowForm(true); }}
            className="flex items-center justify-center gap-2 p-6 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl font-black border-2 border-dashed border-red-200 dark:border-red-900/30 hover:bg-red-100 transition-all"
          >
            <ArrowUpRight className="w-6 h-6" />
            Udhar Given
          </button>
          <button 
            onClick={() => { setType('payment'); setShowForm(true); }}
            className="flex items-center justify-center gap-2 p-6 bg-green-50 dark:bg-green-900/10 text-green-600 rounded-2xl font-black border-2 border-dashed border-green-200 dark:border-green-900/30 hover:bg-green-100 transition-all"
          >
            <ArrowDownLeft className="w-6 h-6" />
            Payment Recv
          </button>
        </div>
      ) : (
        <form onSubmit={handleAddEntry} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-primary/20 shadow-xl space-y-4 animate-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg">Add {type === 'credit' ? 'Udhar Given' : 'Payment Received'}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${type === 'credit' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {type}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">Amount</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  autoFocus
                  type="number"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase">Note (Optional)</label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea 
                rows={2}
                placeholder="Details about this transaction..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className={`flex-[2] px-6 py-3 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
                type === 'credit' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white px-2">History</h2>
        {entries.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500">No entries recorded for this customer yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    entry.type === 'credit' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {entry.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 dark:text-white">
                        {formatCurrency(entry.amount, profile?.currency)}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        entry.type === 'credit' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {entry.type === 'credit' ? 'Given' : 'Paid'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      {entry.note && (
                        <span className="flex items-center gap-1 italic">
                          <StickyNote className="w-3 h-3" />
                          {entry.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
