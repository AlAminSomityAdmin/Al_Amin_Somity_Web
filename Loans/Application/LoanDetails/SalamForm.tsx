// src/components/Loans/Application/LoanDetails/SalamForm.tsx
import React, { useState, useEffect } from 'react';
import { useOrganizationSettings } from '../../../../context/OrganizationSettingsContext';
import { DollarSign, Truck, Package } from 'lucide-react';

interface SalamFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const SalamForm: React.FC<SalamFormProps> = ({ onSubmit, onBack, initialData }) => {
  useOrganizationSettings();

  const [formData, setFormData] = useState({
    productName: initialData?.productName || '',
    productType: initialData?.productType || '',
    quantity: initialData?.quantity || '',
    unitType: initialData?.unitType || 'kg',
    unitPrice: initialData?.unitPrice || '',
    totalPrice: initialData?.totalPrice || 0,
    advancePayment: initialData?.advancePayment || 0,
    deliveryDate: initialData?.deliveryDate || '',
    deliveryLocation: initialData?.deliveryLocation || '',
    qualitySpecifications: initialData?.qualitySpecifications || '',
    penaltyClause: initialData?.penaltyClause || '',
    inspectionRequired: initialData?.inspectionRequired || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.quantity && formData.unitPrice) {
      setFormData(prev => ({ ...prev, totalPrice: parseFloat(prev.quantity) * parseFloat(prev.unitPrice) }));
    }
  }, [formData.quantity, formData.unitPrice]);

  const productTypeOptions = [{ value: 'agricultural', label: 'Agricultural' }, { value: 'livestock', label: 'Livestock' }, { value: 'fisheries', label: 'Fisheries' }, { value: 'minerals', label: 'Minerals' }, { value: 'other', label: 'Other' }];
  const unitTypeOptions = [{ value: 'kg', label: 'Kilogram (kg)' }, { value: 'ton', label: 'Metric Ton' }, { value: 'piece', label: 'Piece' }, { value: 'liter', label: 'Liter' }, { value: 'bag', label: 'Bag' }, { value: 'other', label: 'Other' }];

  const minDeliveryDate = new Date(); minDeliveryDate.setMonth(minDeliveryDate.getMonth() + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.productName) newErrors.productName = 'Product name is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.unitPrice) newErrors.unitPrice = 'Unit price is required';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
    if (!formData.deliveryLocation) newErrors.deliveryLocation = 'Delivery location is required';
    if (Object.keys(newErrors).length === 0) onSubmit(formData);
    else setErrors(newErrors);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-orange-800 mb-4">Salam Prepayment Details</h2>
      <p className="text-gray-500 text-sm mb-6">Advance payment for future delivery of goods</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label><div className="relative"><Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" value={formData.productName} onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" /></div>{errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label><select value={formData.productType} onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{productTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label><input type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label><select value={formData.unitType} onChange={(e) => setFormData(prev => ({ ...prev, unitType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{unitTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (BDT) *</label><input type="number" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="number" value={formData.totalPrice} readOnly className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-100" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment (BDT)</label><input type="number" value={formData.advancePayment} onChange={(e) => setFormData(prev => ({ ...prev, advancePayment: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label><input type="date" value={formData.deliveryDate} onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))} min={minDeliveryDate.toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location *</label><div className="relative"><Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" value={formData.deliveryLocation} onChange={(e) => setFormData(prev => ({ ...prev, deliveryLocation: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-lg" /></div>{errors.deliveryLocation && <p className="text-red-500 text-xs mt-1">{errors.deliveryLocation}</p>}</div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Quality Specifications</label><textarea value={formData.qualitySpecifications} onChange={(e) => setFormData(prev => ({ ...prev, qualitySpecifications: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Quality specifications..." /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Penalty Clause</label><input type="text" value={formData.penaltyClause} onChange={(e) => setFormData(prev => ({ ...prev, penaltyClause: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Penalty for delay or default" /></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="inspectionRequired" checked={formData.inspectionRequired} onChange={(e) => setFormData(prev => ({ ...prev, inspectionRequired: e.target.checked }))} className="w-4 h-4" /><label htmlFor="inspectionRequired" className="text-sm">Inspection Required</label></div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Salam Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Product:</span><div className="font-semibold">{formData.productName || '-'}</div></div>
            <div><span className="text-gray-600">Quantity:</span><div className="font-semibold">{formData.quantity} {formData.unitType}</div></div>
            <div><span className="text-gray-600">Total Price:</span><div className="font-semibold">৳{formData.totalPrice.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Delivery:</span><div className="font-semibold">{formData.deliveryDate || '-'}</div></div>
          </div>
        </div>

        <div className="flex justify-between pt-4"><button type="button" onClick={onBack} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back</button><button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Next Step</button></div>
      </form>
    </div>
  );
};

export default SalamForm;