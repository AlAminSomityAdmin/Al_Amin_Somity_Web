// src/components/Loans/RepaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationSettings } from '../../context/OrganizationSettingsContext';
import { loanService } from '../../services/loanService';
import { DollarSign, CreditCard, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BankInfoFields from '../../components/Common/BankInfoFields';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loanId: string;
  memberId: string;
  dueAmount: number;
  monthlyInstallment: number;
}

const RepaymentModal: React.FC<RepaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loanId,
  memberId,
  dueAmount,
  monthlyInstallment
}) => {
  const { currentOrganization } = useAuth();
  const { settings, formatAmount } = useOrganizationSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    paymentType: 'cash' as 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket',
    collectionStatus: 'collected' as 'collected' | 'deposited' | 'transferred',
    referenceNo: '',
    bankName: '',
    bankReference: ''
  });

  const currencySymbol = settings?.financial?.currencySymbol || '৳';
  const allowedPaymentMethods = (settings?.collection?.allowedPaymentMethods as Array<'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket'>) || ['cash', 'bank', 'bikash', 'nogod', 'rocket'];

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        amount: Math.min(monthlyInstallment, dueAmount || monthlyInstallment || 0),
        paymentType: allowedPaymentMethods.includes(prev.paymentType) ? prev.paymentType : 'cash',
        referenceNo: ''
      }));
    }
  }, [isOpen, monthlyInstallment, dueAmount, allowedPaymentMethods]);

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    bank: 'Bank',
    bikash: 'bKash',
    nogod: 'Nagad',
    rocket: 'Rocket'
  };

  const getCollectionStatusInfo = () => {
    const statusMap: Record<string, { label: string; description: string; color: string }> = {
      collected: {
        label: 'Collected',
        description: 'Collected in cashier bank account',
        color: 'text-blue-600'
      },
      deposited: {
        label: 'Deposited',
        description: 'Deposited into Somity bank account',
        color: 'text-green-600'
      },
      transferred: {
        label: 'Transferred',
        description: 'Transferred to another bank account',
        color: 'text-purple-600'
      }
    };
    return statusMap[formData.collectionStatus];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) return;

    if (formData.amount <= 0 || formData.amount > dueAmount) {
      toast.error(`Please enter a payment amount between 1 and ${currencySymbol}${dueAmount.toLocaleString()}`);
      return;
    }

    if (formData.paymentType === 'bank' && formData.collectionStatus === 'deposited' && (!formData.bankName || !formData.bankReference)) {
      toast.error('ব্যাংকে জমা হলে ব্যাংকের নাম ও রেফারেন্স নম্বর প্রদান করা আবশ্যক।');
      return;
    }
    
    setLoading(true);
    try {
      await loanService.addRepayment(
        currentOrganization.id,
        loanId,
        memberId,
        formData.amount,
        formData.paymentType,
        formData.referenceNo,
        formData.bankName,
        formData.bankReference,
        formData.collectionStatus
      );
      toast.success('Repayment recorded successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording repayment:', error);
      toast.error(error.message || 'Failed to record repayment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full mt-10">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur backdrop-slate-50">
          <h2 className="text-xl font-bold">Record Repayment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Due Info */}
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span>Monthly Installment:</span>
              <span className="font-semibold">{formatAmount(monthlyInstallment)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Total Due:</span>
              <span className="font-semibold text-red-600">{formatAmount(dueAmount)}</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                required
                min="1"
                max={dueAmount}
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum: {currencySymbol}1 | Maximum: {currencySymbol}{dueAmount.toLocaleString()}</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <div className="grid grid-cols-3 gap-2">
              {allowedPaymentMethods.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: method as any }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.paymentType === method
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {paymentMethodLabels[method] || method}
                </button>
              ))}
            </div>
          </div>

          {/* Reference No */}
          {(formData.paymentType === 'bank' || formData.paymentType === 'bikash' || formData.paymentType === 'nogod' || formData.paymentType === 'rocket') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / Reference No</label>
              <input
                type="text"
                value={formData.referenceNo}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., TRX123456"
              />
            </div>
          )}

          {formData.paymentType === 'bank' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <span>💡</span>
                  ব্যাংক পেমেন্ট হলে এখনই দেখান যে টাকা কোথায় আছে: ক্যাশিয়ারের ব্যাংক অ্যাকাউন্টে আছে, সরাসরি সোমিটির ব্যাংকে জমা হয়েছে, কিংবা অন্য কোনও অ্যাকাউন্টে ট্রান্সফার হয়েছে।
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-4">
                {['collected', 'deposited', 'transferred'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, collectionStatus: status as any }))}
                    className={`p-4 rounded-xl text-left transition-all ${
                      formData.collectionStatus === status
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-800 capitalize">{status === 'collected' ? 'Collected' : status === 'deposited' ? 'Deposited' : 'Transferred'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {status === 'collected'
                        ? 'Member paid into cashier bank account'
                        : status === 'deposited'
                          ? 'Money deposited into Somity bank account'
                          : 'Transferred to another account'}
                    </div>
                  </button>
                ))}
              </div>

              {(formData.collectionStatus === 'deposited' || formData.collectionStatus === 'collected') && (
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  {formData.collectionStatus === 'collected' && (
                    <div className="bg-blue-100 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-700">
                        সদস্য টাকা ক্যাশিয়ারের ব্যক্তিগত ব্যাংক অ্যাকাউন্টে দিয়েছেন। ব্যাংক নাম ও ট্রানজেকশন আইডি দিন।
                      </p>
                    </div>
                  )}

                  <BankInfoFields
                    bankName={formData.bankName}
                    bankReference={formData.bankReference}
                    onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                    required={formData.collectionStatus === 'deposited'}
                    placeholder={{
                      bankName: formData.collectionStatus === 'collected'
                        ? 'ক্যাশিয়ারের ব্যাংকের নাম'
                        : 'যেমন: Islami Bank, DBBL, Sonali Bank',
                      bankReference: formData.collectionStatus === 'collected'
                        ? 'ট্রানজেকশন রেফারেন্স'
                        : 'স্লিপ নং / চেক নং / ট্রানজেকশন আইডি'
                    }}
                  />
                </div>
              )}

              <div className={`mt-4 p-3 rounded-lg ${
                formData.collectionStatus === 'collected' ? 'bg-blue-100' : formData.collectionStatus === 'deposited' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <p className="text-xs text-gray-600">
                  <strong>Current status:</strong> {getCollectionStatusInfo()?.description}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepaymentModal;