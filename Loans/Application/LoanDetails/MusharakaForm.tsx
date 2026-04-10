// src/components/Loans/Application/LoanDetails/MusharakaForm.tsx
import React, { useState } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface MusharakaFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const MusharakaForm: React.FC<MusharakaFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const islamicConfig = settings?.islamicLoanConfig?.musharaka;
  
  const maxDuration = islamicConfig?.maxDuration || loanSettings?.maxDuration || 120;
  const maxAmount = loanSettings?.maxLoanAmount || 100000;
  const minAmount = loanSettings?.minLoanAmount || 5000;
  const defaultProfitRatio = islamicConfig?.profitSharingRatio || 50;

  const [formData, setFormData] = useState({
    totalCapital: initialData?.totalCapital || '',
    bankShare: initialData?.bankShare || 50,
    clientShare: initialData?.clientShare || 50,
    profitSharingRatio: initialData?.profitSharingRatio || defaultProfitRatio,
    lossSharingRatio: initialData?.lossSharingRatio || 100,
    businessType: initialData?.businessType || '',
    businessDescription: initialData?.businessDescription || '',
    durationMonths: initialData?.durationMonths || 12,
    managementFee: initialData?.managementFee || 1,
    exitClause: initialData?.exitClause || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessTypes = [
    { value: 'trading', label: 'Trading' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'service', label: 'Service' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'livestock', label: 'Livestock' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.totalCapital) newErrors.totalCapital = 'Total capital is required';
    else if (Number(formData.totalCapital) < minAmount) newErrors.totalCapital = `Minimum ${minAmount} BDT`;
    if (Number(formData.bankShare) + Number(formData.clientShare) !== 100) {
      newErrors.bankShare = 'Bank and client shares must total 100%';
    }
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.durationMonths) newErrors.durationMonths = 'Duration is required';
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-green-800 mb-4">Musharaka Partnership Details</h2>
      <p className="text-gray-500 text-sm mb-6">Joint partnership profit-sharing financing</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Capital (BDT) *</label>
            <div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.totalCapital} onChange={(e) => setFormData(prev => ({ ...prev, totalCapital: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder={`${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}`} /></div>
            {errors.totalCapital && <p className="text-red-500 text-xs mt-1">{errors.totalCapital}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months) *</label>
            <div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={formData.durationMonths} onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg"><option value="">Select</option>{[6,12,18,24,36,48,60,72,84,96,108,120].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} months</option>)}</select></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Share (%) *</label>
            <input type="number" value={formData.bankShare} onChange={(e) => setFormData(prev => ({ ...prev, bankShare: parseFloat(e.target.value), clientShare: 100 - parseFloat(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Share (%)</label>
            <input type="number" value={formData.clientShare} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
            <p className="text-xs text-gray-500">Automatically calculated</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profit Sharing Ratio (%) *</label>
            <div className="relative"><TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" step="0.1" value={formData.profitSharingRatio} onChange={(e) => setFormData(prev => ({ ...prev, profitSharingRatio: parseFloat(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" /></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loss Sharing Ratio (%)</label>
            <input type="number" step="0.1" value={formData.lossSharingRatio} onChange={(e) => setFormData(prev => ({ ...prev, lossSharingRatio: parseFloat(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
            <select value={formData.businessType} onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{businessTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
            {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Management Fee (%)</label>
            <input type="number" step="0.1" value={formData.managementFee} onChange={(e) => setFormData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
            <textarea value={formData.businessDescription} onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Describe the business..." />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Exit Clause</label>
            <textarea value={formData.exitClause} onChange={(e) => setFormData(prev => ({ ...prev, exitClause: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Exit clause details..." />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Musharaka Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Total Capital:</span><div className="font-semibold">৳{parseInt(formData.totalCapital || '0').toLocaleString()}</div></div>
            <div><span className="text-gray-600">Bank Share:</span><div className="font-semibold">{formData.bankShare}%</div></div>
            <div><span className="text-gray-600">Client Share:</span><div className="font-semibold">{formData.clientShare}%</div></div>
            <div><span className="text-gray-600">Profit Ratio:</span><div className="font-semibold">{formData.profitSharingRatio}%</div></div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Next Step</button>
        </div>
      </form>
    </div>
  );
};

export default MusharakaForm;