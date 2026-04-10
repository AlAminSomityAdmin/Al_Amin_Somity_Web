// src/components/Loans/Application/LoanDetails/MurabahaForm.tsx
import React, { useState } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Calendar, TrendingUp, Package, Building2, MapPin, Truck } from 'lucide-react';

interface MurabahaFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const MurabahaForm: React.FC<MurabahaFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const islamicConfig = settings?.islamicLoanConfig?.murabaha;
  
  const maxDuration = islamicConfig?.maxDuration || loanSettings?.maxDuration || 60;
  const maxAmount = loanSettings?.maxLoanAmount || 100000;
  const minAmount = loanSettings?.minLoanAmount || 1000;
  const defaultProfitRate = islamicConfig?.profitRate || loanSettings?.defaultInterestRate || 10;

  const [formData, setFormData] = useState({
    assetCost: initialData?.assetCost || '',
    profitRate: initialData?.profitRate || defaultProfitRate,
    durationMonths: initialData?.durationMonths || 12,
    purpose: initialData?.purpose || '',
    assetName: initialData?.assetName || '',
    sellerName: initialData?.sellerName || '',
    sellerAddress: initialData?.sellerAddress || '',
    deliveryDate: initialData?.deliveryDate || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateTotals = () => {
    const assetCost = Number(formData.assetCost);
    const profitRate = Number(formData.profitRate);
    const duration = Number(formData.durationMonths);
    if (!assetCost || !profitRate || !duration) return { profitAmount: 0, totalPayable: 0, monthlyInstallment: 0 };
    const profitAmount = (assetCost * profitRate * duration) / 1200;
    const totalPayable = assetCost + profitAmount;
    const monthlyInstallment = totalPayable / duration;
    return { profitAmount, totalPayable, monthlyInstallment };
  };

  const { profitAmount, totalPayable, monthlyInstallment } = calculateTotals();

  const purposeOptions = [
    { value: 'business', label: 'Business' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'education', label: 'Education' },
    { value: 'medical', label: 'Medical' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'home_appliances', label: 'Home Appliances' },
    { value: 'construction', label: 'Construction' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.assetCost) newErrors.assetCost = 'Asset cost is required';
    else if (Number(formData.assetCost) < minAmount) newErrors.assetCost = `Minimum ${minAmount} BDT`;
    else if (Number(formData.assetCost) > maxAmount) newErrors.assetCost = `Maximum ${maxAmount} BDT`;
    if (!formData.profitRate) newErrors.profitRate = 'Profit rate is required';
    if (!formData.durationMonths) newErrors.durationMonths = 'Duration is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.assetName) newErrors.assetName = 'Asset name is required';
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ ...formData, profitAmount, totalPayable, monthlyInstallment });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Murabaha Financing Details</h2>
      <p className="text-gray-500 text-sm mb-6">Cost-plus financing for asset purchases</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Cost (BDT) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="number" value={formData.assetCost} onChange={(e) => setFormData(prev => ({ ...prev, assetCost: e.target.value }))} className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.assetCost ? 'border-red-500' : 'border-gray-300'}`} placeholder={`${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}`} />
            </div>
            {errors.assetCost && <p className="text-red-500 text-xs mt-1">{errors.assetCost}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profit Rate (%) *</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="number" step="0.1" value={formData.profitRate} onChange={(e) => setFormData(prev => ({ ...prev, profitRate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months) *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select value={formData.durationMonths} onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) }))} className="w-full pl-10 pr-3 py-2 border rounded-lg">
                <option value="">Select</option>
                {[3,6,9,12,18,24,30,36,42,48,54,60].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            {errors.durationMonths && <p className="text-red-500 text-xs mt-1">{errors.durationMonths}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
            <select value={formData.purpose} onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select purpose</option>
              {purposeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={formData.assetName} onChange={(e) => setFormData(prev => ({ ...prev, assetName: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder="e.g., Laptop, Land, Vehicle" />
            </div>
            {errors.assetName && <p className="text-red-500 text-xs mt-1">{errors.assetName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={formData.sellerName} onChange={(e) => setFormData(prev => ({ ...prev, sellerName: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seller Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={formData.sellerAddress} onChange={(e) => setFormData(prev => ({ ...prev, sellerAddress: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        {Number(formData.assetCost) > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Calculation Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-gray-600">Profit Amount:</span><div className="font-semibold">৳{profitAmount.toLocaleString()}</div></div>
              <div><span className="text-gray-600">Total Payable:</span><div className="font-semibold">৳{totalPayable.toLocaleString()}</div></div>
              <div><span className="text-gray-600">Monthly Installment:</span><div className="font-semibold text-green-600">৳{monthlyInstallment.toLocaleString()}</div></div>
              <div><span className="text-gray-600">Profit Margin:</span><div className="font-semibold">{((profitAmount / Number(formData.assetCost)) * 100).toFixed(1)}%</div></div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next Step</button>
        </div>
      </form>
    </div>
  );
};

export default MurabahaForm;