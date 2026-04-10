// src/pages/Loans/LoanList.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationSettings } from '../../context/OrganizationSettingsContext';
import { loanService } from '../../services/loanService';
import { Link } from 'react-router-dom';
import { Eye, Loader2, Search, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

const LoanList: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { formatDate, formatAmount } = useOrganizationSettings();

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { icon: any; label: string; color: string }> = {
      pending: { icon: Clock, label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      approved: { icon: Clock, label: 'Approved', color: 'bg-blue-100 text-blue-700' },
      active: { icon: CheckCircle, label: 'Active', color: 'bg-green-100 text-green-700' },
      completed: { icon: CheckCircle, label: 'Completed', color: 'bg-gray-100 text-gray-700' },
      rejected: { icon: XCircle, label: 'Rejected', color: 'bg-red-100 text-red-700' }
    };
    const s = styles[status] || styles.pending;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        <Icon className="h-3 w-3" />
        {s.label}
      </span>
    );
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    pending: loans.filter(l => l.status === 'pending').length,
    completed: loans.filter(l => l.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan List</h1>
            <p className="text-gray-500 mt-1">Manage and track all loans</p>
          </div>
          <Link
            to="/loans/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Apply for Loan
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Loans</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Active Loans</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by member name or loan ID..."
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
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
                    <td className="px-6 py-4 font-semibold text-green-600">{formatAmount(loan.amount)}</td>
                    <td className="px-6 py-4 text-blue-600">{formatAmount(loan.paidAmount || 0)}</td>
                    <td className="px-6 py-4">{getStatusBadge(loan.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(loan.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link to={`/loans/details/${loan.id}`} className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLoans.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No loans found</p>
              <Link to="/loans/add" className="mt-2 inline-block text-blue-600 hover:text-blue-700">
                Apply for a loan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanList;