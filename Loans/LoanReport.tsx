// src/pages/Loans/LoanReport.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationSettings } from '../../context/OrganizationSettingsContext';
import { parseToDate, formatDate } from '../../utils/dateUtils';
import { loanService } from '../../services/loanService';
import { 
  Loader2, Download, TrendingUp, DollarSign, 
  BarChart3, PieChart
} from 'lucide-react';
import { toast } from 'sonner';
import type { LoanApplication } from '../../types';

const LoanReport: React.FC = () => {
  const { currentOrganization } = useAuth();
  const { formatAmount } = useOrganizationSettings();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchLoans();
  }, [currentOrganization]);

  const fetchLoans = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const data = await loanService.getAllLoans(currentOrganization.id);
      setLoans(data);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLoans = () => {
    return loans.filter(loan => {
      const date = parseToDate(loan.createdAt);
      if (!date) return false;
      if (reportType === 'monthly') {
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      } else {
        return date.getFullYear() === selectedYear;
      }
    });
  };

  const filteredLoans = getFilteredLoans();
  
  const totalDisbursed = filteredLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalCollected = filteredLoans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const totalOutstanding = filteredLoans.reduce((sum, l) => sum + (l.dueAmount || 0), 0);
  const totalInterest = filteredLoans.reduce((sum, l) => sum + (l.totalPayable - l.amount), 0);
  
  const completedCount = filteredLoans.filter(l => l.status === 'completed').length;
  const activeCount = filteredLoans.filter(l => l.status === 'active').length;
  const defaultCount = filteredLoans.filter(l => l.status === 'defaulted').length;

  // Loan type wise distribution
  const loanTypeDistribution = filteredLoans.reduce((acc, loan) => {
    const type = loan.loanType;
    acc[type] = (acc[type] || 0) + loan.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = () => {
    const headers = ['Loan ID', 'Member Name', 'Loan Type', 'Amount', 'Paid', 'Due', 'Interest', 'Status', 'Date'];
    const rows = filteredLoans.map(loan => [
      loan.loanId,
      loan.memberName,
      loan.loanType,
      formatAmount(loan.amount),
      formatAmount(loan.paidAmount || 0),
      formatAmount(loan.dueAmount || 0),
      formatAmount((loan.totalPayable || 0) - (loan.amount || 0)),
      loan.status,
      formatDate(loan.createdAt)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_report_${reportType}_${selectedMonth + 1}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Reports</h1>
            <p className="text-gray-500 mt-1">Loan analytics and reporting</p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setReportType('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    reportType === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setReportType('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    reportType === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {reportType === 'monthly' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {months.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {reportType === 'yearly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-lg"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Disbursed</p>
                <p className="text-2xl font-bold text-blue-600">{formatAmount(totalDisbursed)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(totalCollected)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatAmount(totalOutstanding)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Interest</p>
                <p className="text-2xl font-bold text-purple-600">{formatAmount(totalInterest)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Loan Status Distribution
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed</span>
                  <span className="font-semibold">{completedCount}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${filteredLoans.length ? (completedCount / filteredLoans.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active</span>
                  <span className="font-semibold">{activeCount}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${filteredLoans.length ? (activeCount / filteredLoans.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Defaulted</span>
                  <span className="font-semibold">{defaultCount}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${filteredLoans.length ? (defaultCount / filteredLoans.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              Loan Type Distribution
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(loanTypeDistribution).map(([type, amount]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{type}</span>
                    <span className="font-semibold">{formatAmount(amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalDisbursed ? (amount / totalDisbursed) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">Loan Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-6 py-3">Total Number of Loans</td><td className="px-6 py-3 text-right font-semibold">{filteredLoans.length}</td></tr>
                <tr><td className="px-6 py-3">Total Disbursed Amount</td><td className="px-6 py-3 text-right font-semibold text-blue-600">{formatAmount(totalDisbursed)}</td></tr>
                <tr><td className="px-6 py-3">Total Collected Amount</td><td className="px-6 py-3 text-right font-semibold text-green-600">{formatAmount(totalCollected)}</td></tr>
                <tr><td className="px-6 py-3">Total Outstanding Amount</td><td className="px-6 py-3 text-right font-semibold text-orange-600">{formatAmount(totalOutstanding)}</td></tr>
                <tr><td className="px-6 py-3">Total Interest Earned</td><td className="px-6 py-3 text-right font-semibold text-purple-600">{formatAmount(totalInterest)}</td></tr>
                <tr><td className="px-6 py-3">Collection Rate</td><td className="px-6 py-3 text-right font-semibold text-green-600">{totalDisbursed ? Math.round((totalCollected / totalDisbursed) * 100) : 0}%</td></tr>
                <tr><td className="px-6 py-3">Average Loan Size</td><td className="px-6 py-3 text-right font-semibold">{formatAmount(filteredLoans.length ? Math.round(totalDisbursed / filteredLoans.length) : 0)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanReport;