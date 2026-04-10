// src/components/Loans/Application/LoanDetails/IjarahForm.tsx
import React, { useState } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Calendar, Home, Shield, Car, Building2 } from 'lucide-react';

interface IjarahFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const IjarahForm: React.FC<IjarahFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const islamicConfig = settings?.islamicLoanConfig?.ijarah;
  const maxDuration = islamicConfig?.maxDuration || loanSettings?.maxDuration || 60;
  const maxAmount = loanSettings?.maxLoanAmount || 100000;

  const [formData, setFormData] = useState({
    assetType: initialData?.assetType || '',
    assetDescription: initialData?.assetDescription || '',
    assetValue: initialData?.assetValue || '',
    leasePeriod: initialData?.leasePeriod || 12,
    rentalAmount: initialData?.rentalAmount || '',
    rentalFrequency: initialData?.rentalFrequency || 'monthly',
    securityDeposit: initialData?.securityDeposit || 0,
    maintenanceResponsibility: initialData?.maintenanceResponsibility || 'lessor',
    purpose: initialData?.purpose || '',
    purchaseOption: initialData?.purchaseOption || false,
    purchasePrice: initialData?.purchasePrice || 0,
    insuranceRequired: initialData?.insuranceRequired !== undefined ? initialData.insuranceRequired : true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const assetTypeOptions = [{ value: 'vehicle', label: 'Vehicle', icon: Car }, { value: 'machinery', label: 'Machinery', icon: Building2 }, { value: 'property', label: 'Property', icon: Home }, { value: 'equipment', label: 'Equipment', icon: Shield }, { value: 'other', label: 'Other', icon: Shield }];
  const rentalFrequencyOptions = [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'yearly', label: 'Yearly' }];
  const maintenanceOptions = [{ value: 'lessor', label: 'Lessor (Owner)' }, { value: 'lessee', label: 'Lessee (Tenant)' }, { value: 'shared', label: 'Shared' }];

  const totalRental = formData.rentalAmount && formData.leasePeriod ? formData.rentalAmount * formData.leasePeriod : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.assetType) newErrors.assetType = 'Asset type is required';
    if (!formData.assetValue) newErrors.assetValue = 'Asset value is required';
    if (!formData.rentalAmount) newErrors.rentalAmount = 'Rental amount is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (Object.keys(newErrors).length === 0) onSubmit(formData);
    else setErrors(newErrors);
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-pink-800 mb-4">Ijarah Lease Details</h2>
      <p className="text-gray-500 text-sm mb-6">Lease-based financing for assets</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Asset Type *</label><select value={formData.assetType} onChange={(e) => setFormData(prev => ({ ...prev, assetType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{assetTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.assetType && <p className="text-red-500 text-xs mt-1">{errors.assetType}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Asset Value (BDT) *</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.assetValue} onChange={(e) => setFormData(prev => ({ ...prev, assetValue: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder={`Up to ${maxAmount.toLocaleString()}`} /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Lease Period (Months) *</label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={formData.leasePeriod} onChange={(e) => setFormData(prev => ({ ...prev, leasePeriod: parseInt(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg"><option value="">Select</option>{[6,12,18,24,36,48,60].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} months</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Rental Amount (BDT) *</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.rentalAmount} onChange={(e) => setFormData(prev => ({ ...prev, rentalAmount: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Rental Frequency</label><select value={formData.rentalFrequency} onChange={(e) => setFormData(prev => ({ ...prev, rentalFrequency: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{rentalFrequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (BDT)</label><input type="number" value={formData.securityDeposit} onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Responsibility</label><select value={formData.maintenanceResponsibility} onChange={(e) => setFormData(prev => ({ ...prev, maintenanceResponsibility: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{maintenanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label><input type="text" value={formData.purpose} onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Purpose of lease" /></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="purchaseOption" checked={formData.purchaseOption} onChange={(e) => setFormData(prev => ({ ...prev, purchaseOption: e.target.checked }))} className="w-4 h-4" /><label htmlFor="purchaseOption" className="text-sm">Purchase option at end of lease</label></div>
          {formData.purchaseOption && (<div><label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (BDT)</label><input type="number" value={formData.purchasePrice} onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /></div>)}
          <div className="flex items-center gap-3"><input type="checkbox" id="insuranceRequired" checked={formData.insuranceRequired} onChange={(e) => setFormData(prev => ({ ...prev, insuranceRequired: e.target.checked }))} className="w-4 h-4" /><label htmlFor="insuranceRequired" className="text-sm">Insurance Required</label></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Asset Description</label><textarea value={formData.assetDescription} onChange={(e) => setFormData(prev => ({ ...prev, assetDescription: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Detailed description of the asset..." /></div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Ijarah Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Asset Value:</span><div className="font-semibold">৳{parseInt(formData.assetValue || '0').toLocaleString()}</div></div>
            <div><span className="text-gray-600">Monthly Rental:</span><div className="font-semibold">৳{parseInt(formData.rentalAmount || '0').toLocaleString()}</div></div>
            <div><span className="text-gray-600">Total Rental:</span><div className="font-semibold">৳{totalRental.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Period:</span><div className="font-semibold">{formData.leasePeriod} months</div></div>
          </div>
        </div>

        <div className="flex justify-between pt-4"><button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button><button type="submit" className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">Next Step</button></div>
      </form>
    </div>
  );
};

export default IjarahForm;