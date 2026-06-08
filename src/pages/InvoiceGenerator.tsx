import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Download, FileText, User,
  Hash, Calendar, Calculator,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function InvoiceGenerator() {
  const { profile } = useProfile();
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('Payment is due within 15 days. Thank you for your business!');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
  }, []);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * ((taxRate || 0) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generatePDF = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clientName) throw new Error('Client name is required');

      const doc = new jsPDF() as any;
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('INVOICE', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice #: ${invoiceNumber}`, 14, 30);
      doc.text(`Date: ${date}`, 14, 35);

      // Business Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(profile?.name || 'Nowworks User', 140, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(profile?.company || 'Freelancer', 140, 27);
      doc.text(profile?.email || '', 140, 32);

      // Client Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('BILL TO:', 14, 55);
      doc.setFontSize(10);
      doc.text(clientName, 14, 62);

      // Items Table
      const tableData = items.map(item => [
        item.description,
        item.quantity,
        formatCurrency(item.price, profile?.currency),
        formatCurrency(item.quantity * item.price, profile?.currency)
      ]);

      autoTable(doc, {
        startY: 75,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
      });

      // Totals
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Subtotal:`, 140, finalY);
      doc.text(formatCurrency(subtotal, profile?.currency), 195, finalY, { align: 'right' });

      doc.text(`Tax (${taxRate}%):`, 140, finalY + 7);
      doc.text(formatCurrency(tax, profile?.currency), 195, finalY + 7, { align: 'right' });

      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL:`, 140, finalY + 17);
      doc.text(formatCurrency(total, profile?.currency), 195, finalY + 17, { align: 'right' });

      // Notes & Terms
      if (notes) {
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text('Notes & Terms:', 14, finalY + 30);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(notes, 14, finalY + 37, { maxWidth: 180 });
      }

      doc.save(`${invoiceNumber}_${clientName.replace(/\s+/g, '_')}.pdf`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Invoice Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quickly create and download professional invoices</p>
        </div>
        <button
          onClick={generatePDF}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] flex items-center gap-2">
                  <User className="w-3 h-3" /> Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Invoice Items
                </h3>
                <button
                  onClick={addItem}
                  className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-50 dark:border-gray-800">
                    <div className="col-span-12 md:col-span-6 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Service/Product name"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/40 dark:text-white"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase text-center">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs text-center outline-none focus:ring-1 focus:ring-primary/40 dark:text-white"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/40 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Notes & Terms</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white resize-none"
                placeholder="Enter payment terms or special instructions..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary p-8 rounded-[32px] shadow-xl shadow-primary/20 text-white space-y-8">
            <h3 className="font-bold flex items-center gap-2 text-white/90">
              <Calculator className="w-5 h-5" /> Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="font-bold">
                  {formatCurrency(calculateSubtotal(), profile?.currency)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Tax (%)</span>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-right outline-none text-white font-bold"
                  />
                </div>
                <div className="flex justify-between items-center text-sm text-white/40 italic">
                  <span>Tax Amount</span>
                  <span>{formatCurrency(calculateTax(), profile?.currency)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-col gap-1">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest text-right">Total Amount</span>
                <span className="text-4xl font-black text-right">
                  {formatCurrency(calculateTotal(), profile?.currency)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/20 flex items-center gap-3 text-xs font-bold animate-in zoom-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-2xl border border-green-100 dark:border-green-900/20 flex items-center gap-3 text-xs font-bold animate-in zoom-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Invoice downloaded successfully!</span>
            </div>
          )}

          <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            <p className="font-bold mb-2 text-gray-700 dark:text-gray-300">💡 Pro Tip:</p>
            Business details like your name, company, and email are automatically synced from your <strong>Settings</strong>. Keep them updated for professional results.
          </div>
        </div>
      </div>
    </div>
  );
}
