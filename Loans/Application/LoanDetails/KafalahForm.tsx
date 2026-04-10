// src/components/Loans/Application/LoanDetails/KafalahForm.tsx
import React, { useState, useEffect } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Calendar, Users } from 'lucide-react';

interface KafalahFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const KafalahForm: React.FC<KafalahFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const islamicConfig = settings?.islamicLoanConfig?.kafalah;
  const maxDuration = islamicConfig?.maxDuration || loanSettings?.maxDuration || 60;
  const maxAmount = islamicConfig?.maxGuaranteeAmount || loanSettings?.maxLoanAmount || 100000;
  const defaultFee = islamicConfig?.guaranteeFee || 1;

  const [formData, setFormData] = useState({
    guaranteeAmount: initialData?.guaranteeAmount || '',
    guaranteeType: initialData?.guaranteeType || '',
    beneficiary: initialData?.beneficiary || '',
    durationMonths: initialData?.durationMonths || 12,
    guaranteeFee: initialData?.guaranteeFee || defaultFee,
    guaranteeFeeAmount: initialData?.guaranteeFeeAmount || 0,
    purpose: initialData?.purpose || '',
    contractReference: initialData?.contractReference || '',
    conditions: initialData?.conditions || '',
    collateralRequired: initialData?.collateralRequired || false,
    collateralDetails: initialData?.collateralDetails || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const amount = parseFloat(formData.guaranteeAmount) || 0;
    const fee = parseFloat(formData.guaranteeFee) || 0;
    setFormData(prev => ({ ...prev, guaranteeFeeAmount: (amount * fee) / 100 }));
  }, [formData.guaranteeAmount, formData.guaranteeFee]);

  const guaranteeTypeOptions = [{ value: 'financial', label: 'Financial Guarantee' }, { value: 'performance', label: 'Performance Guarantee' }, { value: 'bid_bond', label: 'Bid Bond' }, { value: 'advance_payment', label: 'Advance Payment Guarantee' }, { value: 'other', label: 'Other' }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.guaranteeAmount) newErrors.guaranteeAmount = 'Guarantee amount is required';
    if (!formData.guaranteeType) newErrors.guaranteeType = 'Guarantee type is required';
    if (!formData.beneficiary) newErrors.beneficiary = 'Beneficiary is required';
    if (!formData.durationMonths) newErrors.durationMonths = 'Duration is required';
    if (Object.keys(newErrors).length === 0) onSubmit(formData);
    else setErrors(newErrors);
  };

  const totalAmount = (parseFloat(formData.guaranteeAmount) || 0) + (formData.guaranteeFeeAmount || 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-yellow-800 mb-4">Kafalah Guarantee Details</h2>
      <p className="text-gray-500 text-sm mb-6">Third-party guarantee for obligations</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Type *</label><select value={formData.guaranteeType} onChange={(e) => setFormData(prev => ({ ...prev, guaranteeType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{guaranteeTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.guaranteeType && <p className="text-red-500 text-xs mt-1">{errors.guaranteeType}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Amount (BDT) *</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.guaranteeAmount} onChange={(e) => setFormData(prev => ({ ...prev, guaranteeAmount: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder={`Up to ${maxAmount.toLocaleString()}`} /></div>{errors.guaranteeAmount && <p className="text-red-500 text-xs mt-1">{errors.guaranteeAmount}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary *</label><div className="relative"><Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" value={formData.beneficiary} onChange={(e) => setFormData(prev => ({ ...prev, beneficiary: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months) *</label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={formData.durationMonths} onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg"><option value="">Select</option>{[3,6,12,18,24,36,48,60].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} months</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Fee (%)</label><input type="number" step="0.1" value={formData.guaranteeFee} onChange={(e) => setFormData(prev => ({ ...prev, guaranteeFee: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Fee Amount (BDT)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.guaranteeFeeAmount} readOnly className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-100" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label><input type="text" value={formData.purpose} onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contract Reference</label><input type="text" value={formData.contractReference} onChange={(e) => setFormData(prev => ({ ...prev, contractReference: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Conditions</label><textarea value={formData.conditions} onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Terms and conditions of the guarantee..." /></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="collateralRequired" checked={formData.collateralRequired} onChange={(e) => setFormData(prev => ({ ...prev, collateralRequired: e.target.checked }))} className="w-4 h-4" /><label htmlFor="collateralRequired" className="text-sm">Collateral Required</label></div>
          {formData.collateralRequired && (<div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Collateral Details</label><textarea value={formData.collateralDetails} onChange={(e) => setFormData(prev => ({ ...prev, collateralDetails: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Details of collateral..." /></div>)}
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Kafalah Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Guarantee:</span><div className="font-semibold">৳{parseInt(formData.guaranteeAmount || '0').toLocaleString()}</div></div>
            <div><span className="text-gray-600">Fee:</span><div className="font-semibold">{formData.guaranteeFee}%</div></div>
            <div><span className="text-gray-600">Fee Amount:</span><div className="font-semibold">৳{formData.guaranteeFeeAmount.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Total:</span><div className="font-semibold">৳{totalAmount.toLocaleString()}</div></div>
          </div>
        </div>

        <div className="flex justify-between pt-4"><button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button><button type="submit" className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">Next Step</button></div>
      </form>
    </div>
  );
};

export default KafalahForm;