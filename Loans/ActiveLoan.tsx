// src/pages/Loans/ActiveLoan.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationSettings } from '../../context/OrganizationSettingsContext';
import { loanService } from '../../services/loanService';
import { 
  Eye, Loader2, Search, 
  CheckCircle} from 'lucide-react';
import { toast } from 'sonner';
import type { LoanApplication } from '../../types';

const ActiveLoan: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActiveLoans();
  }, [currentOrganization]);

  const fetchActiveLoans = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const data = await loanService.getLoansByStatus(currentOrganization.id, 'active');
      setLoans(data);
      setFilteredLoans(data);
    } catch (error) {
      console.error('Error fetching active loans:', error);
      toast.error('Failed to load active loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = loans.filter(loan =>
        loan.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLoans(filtered);
    } else {
      setFilteredLoans(loans);
    }
  }, [searchTerm, loans]);

  const { formatDate, formatAmount } = useOrganizationSettings();

  const getProgressPercentage = (loan: LoanApplication) => {
    const paid = loan.paidAmount || 0;
    const total = loan.totalPayable;
    return total > 0 ? (paid / total) * 100 : 0;
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Active Loans</h1>
          <p className="text-gray-500 mt-1">Currently running loans</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Active Loans</p>
            <p className="text-2xl font-bold text-blue-600">{loans.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatAmount(loans.reduce((sum, l) => sum + (l.dueAmount || 0), 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatAmount(loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0))}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by Member Name or Loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Remaining</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLoans.map((loan) => {
                  const progress = getProgressPercentage(loan);
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{loan.loanId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{loan.memberName}</p>
                        <p className="text-xs text-gray-500">{loan.memberId}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatAmount(loan.amount)}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">{formatAmount(loan.paidAmount || 0)}</td>
                      <td className="px-6 py-4 text-orange-600 font-semibold">{formatAmount(loan.dueAmount || 0)}</td>
                      <td className="px-6 py-4 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-medium">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {loan.dueDate ? formatDate(loan.dueDate) : 'N/A'}
                       </td>
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
                  );
                })}
              </tbody>
             </table>
          </div>
          
          {filteredLoans.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">No active loans</p>
              <p className="text-sm text-gray-500 mt-1">All loans have been completed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveLoan;