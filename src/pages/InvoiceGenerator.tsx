import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Download, FileText, User, 
  Hash, Calendar, Calculator,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Generate a simple unique invoice number
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
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
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
      doc.setTextColor(37, 99, 235); // Primary color
      doc.text('INVOICE', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice #: ${invoiceNumber}`, 14, 30);
      doc.text(`Date: ${date}`, 14, 35);

      // Business Info (From Profile)
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(profile?.name || 'SmartCRM User', 140, 22);
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

      doc.autoTable({
        startY: 75,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
      });

      // Totals
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Subtotal:`, 140, finalY);
      doc.text(formatCurrency(subtotal, profile?.currency), 180, finalY, { align: 'right' });
      
      doc.text(`Tax (${taxRate}%):`, 140, finalY + 7);
      doc.text(formatCurrency(tax, profile?.currency), 180, finalY + 7, { align: 'right' });

      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL:`, 140, finalY + 17);
      doc.text(formatCurrency(total, profile?.currency), 180, finalY + 17, { align: 'right' });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', 105, finalY + 40, { align: 'center' });

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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quickly create and download professional invoices</p>
        </div>
        <button 
          onClick={generatePDF}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> Client Name
                </label>
                <input 
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Invoice Number
                </label>
                <input 
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Invoice Items
                </h3>
                <button 
                  onClick={addItem}
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end group">
                    <div className="col-span-6 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                      <input 
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Service/Product name"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase text-center">Qty</label>
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs text-center outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                      <input 
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                    <div className="col-span-1 pb-2 flex justify-center">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10 space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" /> Totals
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(calculateSubtotal(), profile?.currency)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tax (%)</span>
                  <input 
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-xs text-right outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 text-xs pl-2">Tax Amount</span>
                  <span className="text-gray-400 text-xs italic">
                    {formatCurrency(calculateTax(), profile?.currency)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-black text-primary">
                  {formatCurrency(calculateTotal(), profile?.currency)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Invoice downloaded successfully!</span>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 italic">
            Note: Business details are pulled from your Profile Settings. Please ensure they are up to date.
          </div>
        </div>
      </div>
    </div>
  );
}
