import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  FileText, Table as TableIcon, TrendingUp,
  DollarSign, Loader2, AlertCircle
} from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { formatCurrency } from '../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyData {
  month: string;
  total: number;
  converted: number;
  revenue: number;
}

export default function Reports() {
  const { profile } = useProfile();
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: leads, error: fetchError } = await supabase
        .from('leads')
        .select('created_at, status, value');

      if (fetchError) throw fetchError;

      // Group by month
      const monthlyMap: Record<string, MonthlyData> = {};

      leads?.forEach(lead => {
        const date = new Date(lead.created_at);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        if (!monthlyMap[monthYear]) {
          monthlyMap[monthYear] = { month: monthYear, total: 0, converted: 0, revenue: 0 };
        }

        monthlyMap[monthYear].total += 1;
        if (lead.status === 'Converted') {
          monthlyMap[monthYear].converted += 1;
          monthlyMap[monthYear].revenue += lead.value || 0;
        }
      });

      // Sort by date
      const sortedData = Object.values(monthlyMap).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

      setData(sortedData);
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Month', 'Total Leads', 'Converted Leads', 'Conversion Rate (%)', `Revenue (${profile?.currency || 'USD'})`];
    const rows = data.map(m => [
      m.month,
      m.total,
      m.converted,
      ((m.converted / m.total) * 100).toFixed(1),
      m.revenue
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Nowworks_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;

    doc.setFontSize(20);
    doc.text('Nowworks Business Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = data.map(m => [
      m.month,
      m.total,
      m.converted,
      `${((m.converted / m.total) * 100).toFixed(1)}%`,
      formatCurrency(m.revenue, profile?.currency)
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Month', 'Total Leads', 'Converted', 'Conv. Rate', 'Revenue']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Nowworks_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500 animate-pulse">Generating your business reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze your sales performance and lead trends</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-all shadow-sm"
          >
            <TableIcon className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <FileText className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Lead Growth
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="total" name="Total Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Revenue Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value, profile?.currency)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 6, fill: '#22c55e' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">Summary Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total Leads</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Converted</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Conv. Rate</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((m) => (
                <tr key={m.month} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{m.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center">{m.total}</td>
                  <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-bold text-center">{m.converted}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                      {((m.converted / m.total) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                    {formatCurrency(m.revenue, profile?.currency)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No lead data available to generate reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
