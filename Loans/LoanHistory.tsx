// src/pages/Loans/LoanHistory.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationSettings } from '../../context/OrganizationSettingsContext';
import { loanService } from '../../services/loanService';
import { 
  Eye, Loader2, Search, Download, 
  CheckCircle, XCircle, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import type { LoanApplication } from '../../types';

const LoanHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { formatDate, formatAmount } = useOrganizationSettings();

  useEffect(() => {
    fetchAllLoans();
  }, [currentOrganization]);

  const fetchAllLoans = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const data = await loanService.getAllLoans(currentOrganization.id);
      setLoans(data);
      setFilteredLoans(data);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...loans];
    
    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }
    
    setFilteredLoans(filtered);
  }, [searchTerm, statusFilter, loans]);

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
      defaulted: { label: 'Defaulted', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const s = statuses[status] || statuses.pending;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        <Icon className="h-3 w-3" />
        {s.label}
      </span>
    );
  };

  const handleExport = () => {
    const headers = ['Loan ID', 'Member Name', 'Member ID', 'Amount', 'Paid', 'Due', 'Status', 'Start Date', 'End Date'];
    const rows = filteredLoans.map(loan => [
      loan.loanId,
      loan.memberName,
      loan.memberId,
      formatAmount(loan.amount),
      formatAmount(loan.paidAmount || 0),
      formatAmount(loan.dueAmount || 0),
      loan.status,
      formatDate(loan.createdAt),
      loan.completedAt ? formatDate(loan.completedAt) : 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Loan History</h1>
            <p className="text-gray-500 mt-1">Complete loan transaction history</p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Loans</p>
            <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Disbursed</p>
            <p className="text-2xl font-bold text-blue-600">{formatAmount(loans.reduce((sum, l) => sum + l.amount, 0))}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatAmount(loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0))}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {Math.round((loans.filter(l => l.status === 'completed').length / loans.length) * 100) || 0}%
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by Member Name or Loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Loans Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Loan ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{loan.loanId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{loan.memberName}</p>
                      <p className="text-xs text-gray-500">{loan.memberId}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatAmount(loan.amount)}</td>
                    <td className="px-6 py-4 text-green-600">{formatAmount(loan.paidAmount || 0)}</td>
                    <td className="px-6 py-4">{getStatusBadge(loan.status)}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(loan.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(loan.completedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/loans/details/${loan.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                     </td>
                   </tr>
                ))}
              </tbody>
             </table>
          </div>
          
          {filteredLoans.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No loan history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;