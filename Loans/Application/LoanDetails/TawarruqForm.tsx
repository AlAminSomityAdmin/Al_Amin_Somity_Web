// src/components/Loans/Application/LoanDetails/TawarruqForm.tsx
import React, { useState, useEffect } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Calendar } from 'lucide-react';

interface TawarruqFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const TawarruqForm: React.FC<TawarruqFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const maxDuration = loanSettings?.maxDuration || 36;
  const defaultProfitRate = loanSettings?.defaultInterestRate || 10;

  const [formData, setFormData] = useState({
    commodityType: initialData?.commodityType || '',
    commodityName: initialData?.commodityName || '',
    quantity: initialData?.quantity || '',
    unitPrice: initialData?.unitPrice || '',
    totalCost: initialData?.totalCost || 0,
    durationMonths: initialData?.durationMonths || 12,
    profitMargin: initialData?.profitMargin || defaultProfitRate,
    purpose: initialData?.purpose || '',
    brokerageFee: initialData?.brokerageFee || 0,
    storageCost: initialData?.storageCost || 0,
    saleConfirmation: initialData?.saleConfirmation || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.quantity && formData.unitPrice) {
      setFormData(prev => ({ ...prev, totalCost: parseFloat(prev.quantity) * parseFloat(prev.unitPrice) }));
    }
  }, [formData.quantity, formData.unitPrice]);

  const profitAmount = formData.totalCost && formData.profitMargin ? (formData.totalCost * formData.profitMargin) / 100 : 0;
  const totalPayable = formData.totalCost + profitAmount + (formData.brokerageFee || 0) + (formData.storageCost || 0);

  const commodityTypeOptions = [{ value: 'precious_metals', label: 'Precious Metals' }, { value: 'agricultural', label: 'Agricultural' }, { value: 'energy', label: 'Energy' }, { value: 'industrial_metals', label: 'Industrial Metals' }, { value: 'other', label: 'Other' }];
  const purposeOptions = [{ value: 'cash_need', label: 'Cash Need' }, { value: 'debt_settlement', label: 'Debt Settlement' }, { value: 'business_capital', label: 'Business Capital' }, { value: 'personal_use', label: 'Personal Use' }, { value: 'other', label: 'Other' }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.commodityType) newErrors.commodityType = 'Commodity type is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (Object.keys(newErrors).length === 0) onSubmit(formData);
    else setErrors(newErrors);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-indigo-800 mb-4">Tawarruq Liquidity Details</h2>
      <p className="text-gray-500 text-sm mb-6">Commodity-based liquidity financing</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Commodity Type *</label><select value={formData.commodityType} onChange={(e) => setFormData(prev => ({ ...prev, commodityType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{commodityTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.commodityType && <p className="text-red-500 text-xs mt-1">{errors.commodityType}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Commodity Name</label><input type="text" value={formData.commodityName} onChange={(e) => setFormData(prev => ({ ...prev, commodityName: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label><input type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (BDT)</label><input type="number" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.totalCost} readOnly className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-100" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={formData.durationMonths} onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg"><option value="">Select</option>{[3,6,12,18,24,30,36].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} months</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Profit Margin (%)</label><input type="number" step="0.1" value={formData.profitMargin} onChange={(e) => setFormData(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label><select value={formData.purpose} onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{purposeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Brokerage Fee (BDT)</label><input type="number" value={formData.brokerageFee} onChange={(e) => setFormData(prev => ({ ...prev, brokerageFee: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Storage Cost (BDT)</label><input type="number" value={formData.storageCost} onChange={(e) => setFormData(prev => ({ ...prev, storageCost: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="saleConfirmation" checked={formData.saleConfirmation} onChange={(e) => setFormData(prev => ({ ...prev, saleConfirmation: e.target.checked }))} className="w-4 h-4" /><label htmlFor="saleConfirmation" className="text-sm">Sale Confirmation</label></div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Tawarruq Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Commodity Cost:</span><div className="font-semibold">৳{formData.totalCost.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Profit Margin:</span><div className="font-semibold">{formData.profitMargin}%</div></div>
            <div><span className="text-gray-600">Profit Amount:</span><div className="font-semibold">৳{profitAmount.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Total Payable:</span><div className="font-semibold">৳{totalPayable.toLocaleString()}</div></div>
          </div>
        </div>

        <div className="flex justify-between pt-4"><button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button><button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Next Step</button></div>
      </form>
    </div>
  );
};

export default TawarruqForm;