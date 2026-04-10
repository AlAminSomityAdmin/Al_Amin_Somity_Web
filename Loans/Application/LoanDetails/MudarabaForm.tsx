// src/components/Loans/Application/LoanDetails/MudarabaForm.tsx
import React, { useState } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Calendar } from 'lucide-react';

interface MudarabaFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const MudarabaForm: React.FC<MudarabaFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const islamicConfig = settings?.islamicLoanConfig?.mudaraba;
  
  const maxDuration = islamicConfig?.maxDuration || loanSettings?.maxDuration || 60;
  const minAmount = loanSettings?.minLoanAmount || 5000;

  const [formData, setFormData] = useState({
    totalCapital: initialData?.totalCapital || '',
    rabulMalShare: initialData?.rabulMalShare || 50,
    mudaribShare: initialData?.mudaribShare || 50,
    businessType: initialData?.businessType || '',
    businessPlan: initialData?.businessPlan || '',
    durationMonths: initialData?.durationMonths || 12,
    expectedProfit: initialData?.expectedProfit || '',
    managementFee: initialData?.managementFee || 1,
    lossAbsorption: initialData?.lossAbsorption || 'rabul_mal',
    auditRequired: initialData?.auditRequired !== undefined ? initialData.auditRequired : true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessTypes = [
    { value: 'trading', label: 'Trading' },
    { value: 'export_import', label: 'Export/Import' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'service', label: 'Service' },
  ];

  const lossAbsorptionOptions = [
    { value: 'rabul_mal', label: 'Rab-ul-Mal (Capital Provider)' },
    { value: 'mudarib', label: 'Mudarib (Entrepreneur)' },
    { value: 'both', label: 'Both' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.totalCapital) newErrors.totalCapital = 'Total capital is required';
    else if (Number(formData.totalCapital) < minAmount) newErrors.totalCapital = `Minimum ${minAmount} BDT`;
    if (formData.rabulMalShare + formData.mudaribShare !== 100) newErrors.rabulMalShare = 'Shares must total 100%';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.durationMonths) newErrors.durationMonths = 'Duration is required';
    
    if (Object.keys(newErrors).length === 0) onSubmit(formData);
    else setErrors(newErrors);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-teal-800 mb-4">Mudaraba Investment Details</h2>
      <p className="text-gray-500 text-sm mb-6">Profit-sharing investment partnership</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Capital (BDT) *</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.totalCapital} onChange={(e) => setFormData(prev => ({ ...prev, totalCapital: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" /></div>{errors.totalCapital && <p className="text-red-500 text-xs mt-1">{errors.totalCapital}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months) *</label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={formData.durationMonths} onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg"><option value="">Select</option>{[6,12,18,24,30,36,42,48,54,60].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} months</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Rab-ul-Mal Share (%) *</label><input type="number" value={formData.rabulMalShare} onChange={(e) => setFormData(prev => ({ ...prev, rabulMalShare: parseFloat(e.target.value), mudaribShare: 100 - parseFloat(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mudarib Share (%)</label><input type="number" value={formData.mudaribShare} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100" /><p className="text-xs text-gray-500">Automatically calculated</p></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label><select value={formData.businessType} onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{businessTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Expected Profit (%)</label><input type="number" step="0.1" value={formData.expectedProfit} onChange={(e) => setFormData(prev => ({ ...prev, expectedProfit: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Management Fee (%)</label><input type="number" step="0.1" value={formData.managementFee} onChange={(e) => setFormData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Loss Absorption</label><select value={formData.lossAbsorption} onChange={(e) => setFormData(prev => ({ ...prev, lossAbsorption: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{lossAbsorptionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Business Plan</label><textarea value={formData.businessPlan} onChange={(e) => setFormData(prev => ({ ...prev, businessPlan: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Detailed business plan..." /></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="auditRequired" checked={formData.auditRequired} onChange={(e) => setFormData(prev => ({ ...prev, auditRequired: e.target.checked }))} className="w-4 h-4" /><label htmlFor="auditRequired" className="text-sm">Audit Required</label></div>
        </div>

        <div className="bg-teal-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Mudaraba Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Total Capital:</span><div className="font-semibold">৳{parseInt(formData.totalCapital || '0').toLocaleString()}</div></div>
            <div><span className="text-gray-600">Rab-ul-Mal:</span><div className="font-semibold">{formData.rabulMalShare}%</div></div>
            <div><span className="text-gray-600">Mudarib:</span><div className="font-semibold">{formData.mudaribShare}%</div></div>
            <div><span className="text-gray-600">Duration:</span><div className="font-semibold">{formData.durationMonths} months</div></div>
          </div>
        </div>

        <div className="flex justify-between pt-4"><button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button><button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Next Step</button></div>
      </form>
    </div>
  );
};

export default MudarabaForm;