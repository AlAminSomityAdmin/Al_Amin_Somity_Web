// src/pages/Loans/PendingLoan.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationSettings } from '../../context/OrganizationSettingsContext';
import { loanService } from '../../services/loanService';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LoanApplication } from '../../types';

const PendingLoan: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization, user } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatDate, formatAmount } = useOrganizationSettings();

  useEffect(() => {
    fetchPendingLoans();
  }, [currentOrganization]);

  const fetchPendingLoans = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const data = await loanService.getLoansByStatus(currentOrganization.id, 'pending');
      setLoans(data);
    } catch (error) {
      console.error('Error fetching pending loans:', error);
      toast.error('লোন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId: string) => {
    if (!currentOrganization?.id) return;
    
    try {
      await loanService.updateLoanStatus(currentOrganization.id, loanId, 'approved', user?.uid);
      toast.success('লোন অনুমোদন করা হয়েছে');
      fetchPendingLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
      toast.error('লোন অনুমোদনে সমস্যা হয়েছে');
    }
  };

  const handleReject = async (loanId: string) => {
    if (!currentOrganization?.id) return;
    
    try {
      await loanService.updateLoanStatus(currentOrganization.id, loanId, 'rejected', user?.uid);
      toast.success('লোন বাতিল করা হয়েছে');
      fetchPendingLoans();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast.error('লোন বাতিল করতে সমস্যা হয়েছে');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">পেন্ডিং লোন</h1>
          <p className="text-gray-500 mt-1">অনুমোদনের অপেক্ষায় থাকা লোন</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">লোন আইডি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">সদস্য</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">মেয়াদ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{loan.loanId}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{loan.memberName}</p>
                      <p className="text-xs text-gray-500">{loan.memberId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatAmount(loan.amount)}</td>
                    <td className="px-6 py-4 text-sm">{loan.durationMonths} মাস</td>
                    <td className="px-6 py-4 text-sm">{formatDate(loan.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(loan.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="অনুমোদন"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(loan.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="বাতিল"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/loans/details/${loan.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="বিস্তারিত"
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
          
          {loans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">কোনো পেন্ডিং লোন নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingLoan;