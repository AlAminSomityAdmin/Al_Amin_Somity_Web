// src/components/Loans/Application/LoanDetails/QardHasanahForm.tsx
import React, { useState, useEffect } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Calendar } from 'lucide-react';

interface QardHasanahFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const QardHasanahForm: React.FC<QardHasanahFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const islamicConfig = settings?.islamicLoanConfig?.qardHasanah;
  const maxDuration = islamicConfig?.maxDuration || loanSettings?.maxDuration || 36;
  const maxAmount = islamicConfig?.maxAmount || loanSettings?.maxLoanAmount || 50000;
  const defaultServiceCharge = islamicConfig?.serviceFee || 0;

  const [formData, setFormData] = useState({
    loanAmount: initialData?.loanAmount || '',
    durationMonths: initialData?.durationMonths || 12,
    purpose: initialData?.purpose || '',
    serviceChargePercent: initialData?.serviceChargePercent || defaultServiceCharge,
    serviceChargeAmount: initialData?.serviceChargeAmount || 0,
    repaymentSchedule: initialData?.repaymentSchedule || 'monthly',
    emergencyLevel: initialData?.emergencyLevel || 'medium',
    previousQardHistory: initialData?.previousQardHistory || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const amount = parseFloat(formData.loanAmount) || 0;
    const percent = parseFloat(formData.serviceChargePercent) || 0;
    setFormData(prev => ({ ...prev, serviceChargeAmount: (amount * percent) / 100 }));
  }, [formData.loanAmount, formData.serviceChargePercent]);

  const purposeOptions = [{ value: 'emergency', label: 'Emergency' }, { value: 'medical', label: 'Medical' }, { value: 'education', label: 'Education' }, { value: 'marriage', label: 'Marriage' }, { value: 'funeral', label: 'Funeral' }, { value: 'house_repair', label: 'House Repair' }, { value: 'other', label: 'Other' }];
  const repaymentOptions = [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'lump_sum', label: 'Lump Sum' }, { value: 'flexible', label: 'Flexible' }];
  const emergencyOptions = [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }];

  const totalRepayment = (parseFloat(formData.loanAmount) || 0) + (formData.serviceChargeAmount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.loanAmount) newErrors.loanAmount = 'Loan amount is required';
    else if (parseFloat(formData.loanAmount) < 1000) newErrors.loanAmount = 'Minimum 1,000 BDT';
    if (!formData.durationMonths) newErrors.durationMonths = 'Duration is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (Object.keys(newErrors).length === 0) onSubmit(formData);
    else setErrors(newErrors);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-red-800 mb-4">Qard Hasanah Benevolent Loan Details</h2>
      <p className="text-gray-500 text-sm mb-6">Interest-free benevolent loan for needy members</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (BDT) *</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.loanAmount} onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder={`Up to ${maxAmount.toLocaleString()}`} /></div>{errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months) *</label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={formData.durationMonths} onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg"><option value="">Select</option>{[3,6,9,12,18,24,30,36].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} months</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label><select value={formData.purpose} onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{purposeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Emergency Level</label><select value={formData.emergencyLevel} onChange={(e) => setFormData(prev => ({ ...prev, emergencyLevel: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{emergencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (%)</label><input type="number" step="0.1" value={formData.serviceChargePercent} onChange={(e) => setFormData(prev => ({ ...prev, serviceChargePercent: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /><p className="text-xs text-gray-500">Maximum 5% as per Islamic rules</p></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Service Charge Amount (BDT)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.serviceChargeAmount} readOnly className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-100" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Repayment Schedule</label><select value={formData.repaymentSchedule} onChange={(e) => setFormData(prev => ({ ...prev, repaymentSchedule: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{repaymentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="previousQardHistory" checked={formData.previousQardHistory} onChange={(e) => setFormData(prev => ({ ...prev, previousQardHistory: e.target.checked }))} className="w-4 h-4" /><label htmlFor="previousQardHistory" className="text-sm">Previous Qard Hasanah taken</label></div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Qard Hasanah Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Loan Amount:</span><div className="font-semibold">৳{parseInt(formData.loanAmount || '0').toLocaleString()}</div></div>
            <div><span className="text-gray-600">Service Charge:</span><div className="font-semibold">{formData.serviceChargePercent}%</div></div>
            <div><span className="text-gray-600">Service Charge Amount:</span><div className="font-semibold">৳{formData.serviceChargeAmount.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Total Repayment:</span><div className="font-semibold">৳{totalRepayment.toLocaleString()}</div></div>
          </div>
          <p className="text-xs text-red-600 mt-2">💡 Interest-free loan, only service charge applies</p>
        </div>

        <div className="flex justify-between pt-4"><button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button><button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Next Step</button></div>
      </form>
    </div>
  );
};

export default QardHasanahForm;