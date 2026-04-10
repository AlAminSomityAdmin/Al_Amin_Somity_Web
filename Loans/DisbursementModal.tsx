// src/components/Loans/DisbursementModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loanService } from '../../services/loanService';
import { DollarSign, Landmark, Wallet, Clock, Hash, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loanId: string;
  loanAmount: number;
  memberId: string;
  memberName: string;
}

const DisbursementModal: React.FC<DisbursementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loanId,
  loanAmount,
  memberId,
  memberName
}) => {
  const { user, currentOrganization, currentMember } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    disbursementDate: new Date().toISOString().slice(0, 10),
    disbursementMethod: 'cash' as 'cash' | 'bank' | 'cheque' | 'transfer',
    disbursedFrom: 'cashier_fund' as 'cashier_fund' | 'org_bank_account' | 'org_cash',
    bankName: '',
    accountNumber: '',
    chequeNumber: '',
    transactionId: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) {
      toast.error('Organization not found');
      return;
    }
    
    setLoading(true);
    try {
      await loanService.recordDisbursement(
        currentOrganization.id,
        loanId,
        {
          amount: loanAmount,
          disbursementDate: new Date(formData.disbursementDate),
          disbursementMethod: formData.disbursementMethod,
          disbursedFrom: formData.disbursedFrom,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          chequeNumber: formData.chequeNumber,
          transactionId: formData.transactionId,
          receivedBy: memberId,
          receivedByName: memberName,
          receivedByMemberId: memberId,
          disbursedBy: user?.uid || 'system',
          disbursedByName: currentMember?.fullName || user?.email || 'System',
          notes: formData.notes
        }
      );
      toast.success('✅ Disbursement recorded successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording disbursement:', error);
      toast.error(error.message || 'Failed to record disbursement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto mt-10">
        <div className="sticky top-0 bg-white/95 border-b border-slate-200 px-6 py-4 flex justify-between items-center backdrop-blur">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Record Loan Disbursement</h2>
            <p className="text-sm text-gray-500">Track how and when the loan amount is given</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loan Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Loan Amount:</span>
                <div className="font-bold text-green-600">৳{loanAmount.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Member:</span>
                <div className="font-medium">{memberName}</div>
              </div>
              <div>
                <span className="text-gray-600">Member ID:</span>
                <div className="font-mono text-sm">{memberId || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disbursement Date *</label>
              <input
                type="date"
                value={formData.disbursementDate}
                onChange={(e) => setFormData(prev => ({ ...prev, disbursementDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Disbursement Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disbursement Method *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'cash', label: 'Cash', icon: <DollarSign className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
                { value: 'bank', label: 'Bank', icon: <Landmark className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
                { value: 'cheque', label: 'Cheque', icon: <FileText className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700' },
                { value: 'transfer', label: 'Transfer', icon: <Wallet className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700' }
              ].map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, disbursementMethod: method.value as any }))}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                    formData.disbursementMethod === method.value
                      ? `${method.color} border-current`
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  {method.icon}
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source of Funds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'cashier_fund', label: 'Cashier Fund', icon: <Wallet className="h-4 w-4" />, description: 'Cash collected from members' },
                { value: 'org_bank_account', label: 'Organization Bank', icon: <Landmark className="h-4 w-4" />, description: 'Bank account withdrawal' },
                { value: 'org_cash', label: 'Organization Cash', icon: <DollarSign className="h-4 w-4" />, description: 'Org cash reserve' }
              ].map(source => (
                <button
                  key={source.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, disbursedFrom: source.value as any }))}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.disbursedFrom === source.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {source.icon}
                    <span className="font-medium">{source.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{source.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bank/Cheque/Transfer Details */}
          {(formData.disbursementMethod === 'bank' || formData.disbursementMethod === 'transfer') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Islami Bank, DBBL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Account number"
                />
              </div>
            </div>
          )}

          {formData.disbursementMethod === 'cheque' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
              <input
                type="text"
                value={formData.chequeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, chequeNumber: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 000123"
              />
            </div>
          )}

          {(formData.disbursementMethod === 'bank' || formData.disbursementMethod === 'transfer') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  placeholder="TRX123456789"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Additional notes about the disbursement..."
            />
          </div>

          {/* Disbursement Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Disbursed by: {currentMember?.fullName || user?.email || 'System'} ({currentMember?.memberId || 'SYS'})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              Confirm Disbursement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisbursementModal;