// src/components/Loans/Application/LoanDetails/IstisnaForm.tsx
import React, { useState } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { SchemaValidator } from '../../../../utils/schemaValidator';
import { Calendar, DollarSign } from 'lucide-react';

interface IstisnaFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const IstisnaForm: React.FC<IstisnaFormProps> = ({ onSubmit, onBack, initialData }) => {
  const { settings } = useOrganizationSettings();
  const loanSettings = settings?.loan;
  const maxDuration = loanSettings?.maxDuration || 60;
  const maxAmount = loanSettings?.maxLoanAmount || 100000;
  const minAmount = loanSettings?.minLoanAmount || 1000;

  const [formData, setFormData] = useState({
    totalCost: initialData?.totalCost || '',
    durationMonths: initialData?.durationMonths || 12,
    projectName: initialData?.projectName || '',
    projectDescription: initialData?.projectDescription || '',
    specifications: initialData?.specifications || '',
    advancePayment: initialData?.advancePayment || 0,
    completionDate: initialData?.completionDate || '',
    warrantyPeriod: initialData?.warrantyPeriod || 12,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = SchemaValidator.validateLoanDetails('istisna', formData);
    if (validation.isValid) {
      onSubmit(formData);
    } else {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(err => {
        if (err.includes('মোট খরচ')) newErrors.totalCost = err;
        else if (err.includes('মেয়াদ')) newErrors.durationMonths = err;
        else newErrors.general = err;
      });
      setErrors(newErrors);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">প্রকল্পের নাম *</label>
          <input type="text" value={formData.projectName} onChange={(e) => handleChange('projectName', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="প্রকল্পের নাম" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">মোট খরচ (৳) *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="number" value={formData.totalCost} onChange={(e) => handleChange('totalCost', e.target.value)} className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.totalCost ? 'border-red-500' : 'border-gray-300'}`} placeholder={`${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}`} />
          </div>
          {errors.totalCost && <p className="text-red-500 text-xs mt-1">{errors.totalCost}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">মেয়াদ (মাস) *</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select value={formData.durationMonths} onChange={(e) => handleChange('durationMonths', parseInt(e.target.value))} className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.durationMonths ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">সিলেক্ট করুন</option>
              {[6,12,18,24,36,48,60].filter(m => m <= maxDuration).map(m => <option key={m} value={m}>{m} মাস</option>)}
            </select>
          </div>
          {errors.durationMonths && <p className="text-red-500 text-xs mt-1">{errors.durationMonths}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">সমাপ্তির তারিখ</label>
          <input type="date" value={formData.completionDate} onChange={(e) => handleChange('completionDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">অগ্রিম পরিশোধ (৳)</label>
          <input type="number" value={formData.advancePayment} onChange={(e) => handleChange('advancePayment', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ওয়ারেন্টি সময় (মাস)</label>
          <input type="number" value={formData.warrantyPeriod} onChange={(e) => handleChange('warrantyPeriod', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">প্রকল্পের বিবরণ *</label>
          <textarea value={formData.projectDescription} onChange={(e) => handleChange('projectDescription', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="প্রকল্পের বিস্তারিত বিবরণ..." />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">স্পেসিফিকেশন *</label>
          <textarea value={formData.specifications} onChange={(e) => handleChange('specifications', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="টেকনিক্যাল স্পেসিফিকেশন..." />
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-2">ইস্তিসনা সারাংশ</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-purple-600">মোট খরচ:</span><div className="font-semibold">৳ {parseInt(formData.totalCost || '0').toLocaleString()}</div></div>
          <div><span className="text-purple-600">মেয়াদ:</span><div className="font-semibold">{formData.durationMonths} মাস</div></div>
          <div><span className="text-purple-600">ওয়ারেন্টি:</span><div className="font-semibold">{formData.warrantyPeriod} মাস</div></div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">পিছনে</button>
        <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">পরবর্তী ধাপ</button>
      </div>
    </form>
  );
};

export default IstisnaForm;