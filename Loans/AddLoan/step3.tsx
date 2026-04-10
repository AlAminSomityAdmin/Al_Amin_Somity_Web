// src/components/Loans/AddLoan/Step3Finalization.tsx
import React, { useState } from 'react';
import { useOrganizationSettings } from '../../../context/OrganizationSettingsContext';
import { CheckCircle, FileText, Upload, X, User, Users, TrendingUp, Shield, Heart, Home, Building2, Package, Sprout, CreditCard } from 'lucide-react';
import type { LoanFormData } from '../../../pages/Loans/AddLoan';

interface Step3FinalizationProps {
  onSubmit: (data: { remarks?: string; documents: any[] }) => void;
  formData: LoanFormData;
  onBack: () => void;
  loading: boolean;
}

const Step3Finalization: React.FC<Step3FinalizationProps> = ({ onSubmit, formData, onBack, loading }) => {
  const { settings } = useOrganizationSettings();
  const [remarks, setRemarks] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loanSettings = settings?.loan;
  const interestRate = loanSettings?.defaultInterestRate || 10;

  const handleSubmit = () => {
    onSubmit({ remarks: remarks.trim() || undefined, documents });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setUploading(true);
    setTimeout(() => {
      const newDocuments = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }));
      setDocuments(prev => [...prev, ...newDocuments]);
      setUploading(false);
      event.target.value = '';
    }, 500);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLoanTypeDetails = () => {
    const types: Record<string, { name: string; icon: any; color: string; bg: string }> = {
      murabaha: { name: 'Murabaha', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
      musharaka: { name: 'Musharaka', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
      mudaraba: { name: 'Mudaraba', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
      salam: { name: 'Salam', icon: Sprout, color: 'text-orange-600', bg: 'bg-orange-50' },
      ijarah: { name: 'Ijarah', icon: Home, color: 'text-pink-600', bg: 'bg-pink-50' },
      istisna: { name: 'Istisna', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
      kafalah: { name: 'Kafalah', icon: Shield, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      qardHasanah: { name: 'Qard Hasanah', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
      tawarruq: { name: 'Tawarruq', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    };
    return types[formData.loanType] || { name: formData.loanType || 'Loan', icon: CreditCard, color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const loanTypeDetails = getLoanTypeDetails();
  const LoanIcon = loanTypeDetails.icon;

  // Calculate loan summary values with safe fallbacks
  const amount = formData.loanDetails?.assetCost || 
                 formData.loanDetails?.totalCapital || 
                 formData.loanDetails?.loanAmount || 
                 formData.loanDetails?.totalCost || 
                 formData.loanDetails?.assetValue || 
                 formData.loanDetails?.guaranteeAmount || 0;
  const duration = formData.loanDetails?.durationMonths || formData.loanDetails?.leasePeriod || 12;
  const totalPayable = amount * (1 + interestRate / 100);
  const monthlyInstallment = Math.round(totalPayable / duration);

  // Safe access to applicant monthlyIncome
  const monthlyIncome = formData.applicant?.monthlyIncome || 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Step 3: Finalization</h2>
        <p className="text-gray-600">Review all information, upload documents, and submit your application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Review Summary */}
        <div className="space-y-6">
          {/* Applicant Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
              <h3 className="font-semibold text-white flex items-center gap-2"><User className="w-4 h-4" /> Applicant Information</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{formData.applicant?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Type</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${formData.applicant?.isMember ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {formData.applicant?.isMember ? 'Member' : 'Non-Member'}
                </span>
              </div>
              {formData.applicant?.memberID && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Member ID</span>
                  <span className="font-mono text-sm">{formData.applicant.memberID}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span>{formData.applicant?.phone || 'N/A'}</span>
              </div>
              {formData.applicant?.email && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Email</span>
                  <span className="text-sm">{formData.applicant.email}</span>
                </div>
              )}
              {monthlyIncome > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Monthly Income</span>
                  <span className="font-medium text-green-600">৳{monthlyIncome.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guarantor Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
              <h3 className="font-semibold text-white flex items-center gap-2"><Users className="w-4 h-4" /> Guarantor Information</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{formData.grantor?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Member ID</span>
                <span className="font-mono text-sm">{formData.grantor?.memberID || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span>{formData.grantor?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Relation</span>
                <span className="capitalize">{formData.grantor?.relation || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Loan Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className={`bg-gradient-to-r ${loanTypeDetails.bg.replace('bg-', 'from-')} to-${loanTypeDetails.color.split('-')[1]}-100 px-4 py-3`}>
              <h3 className={`font-semibold ${loanTypeDetails.color} flex items-center gap-2`}><LoanIcon className="w-4 h-4" /> Loan Details</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Loan Type</span>
                <span className={`font-medium ${loanTypeDetails.color}`}>{loanTypeDetails.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-green-600">৳{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Duration</span>
                <span>{duration} months</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Interest Rate</span>
                <span>{interestRate}%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500">Monthly Installment</span>
                <span className="font-medium">৳{monthlyInstallment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Payable</span>
                <span className="font-bold text-blue-600">৳{totalPayable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Remarks & Documents */}
        <div className="space-y-6">
          {/* Remarks */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="font-semibold text-gray-800">Remarks (Optional)</h3>
            </div>
            <div className="p-4">
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Additional comments or special instructions..."
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Upload className="w-4 h-4" /> Document Upload</h3>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Upload Required Documents</p>
                <p className="text-sm text-gray-500 mb-4">NID, Photo, Income Certificate, Bank Statement</p>
                <input type="file" multiple onChange={handleFileUpload} disabled={uploading} className="hidden" id="doc-upload" />
                <label htmlFor="doc-upload" className={`inline-flex items-center px-4 py-2 rounded-lg text-white ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} transition-colors`}>
                  {uploading ? 'Uploading...' : 'Select Files'}
                </label>
              </div>

              {documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Uploaded Documents ({documents.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-800">{doc.name}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(doc.size)}</div>
                          </div>
                        </div>
                        <button onClick={() => removeDocument(doc.id)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Application Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Total Documents</span><span className="font-medium">{documents.length} files</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Remarks</span><span className="font-medium">{remarks ? 'Provided' : 'None'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Loan Amount</span><span className="font-medium">৳{amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Monthly Payment</span><span className="font-medium text-green-600">৳{monthlyInstallment.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" className="mt-1 w-4 h-4" required />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I confirm that all information provided is true and accurate. I agree to the{' '}
                <button type="button" onClick={() => setShowPreview(true)} className="text-blue-600 hover:underline">Terms & Conditions</button>
                {' '}and understand that this is an Islamic Shariah-compliant financing.
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
        <button onClick={onBack} disabled={loading} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
          Back
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {documents.length > 0 && `${documents.length} document(s) uploaded`}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terms Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Terms & Conditions</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-sm text-gray-600">
              <p><strong>1. Islamic Shariah Compliance:</strong> This financing is structured according to Islamic Shariah principles...</p>
              <p><strong>2. Payment Obligation:</strong> The customer agrees to make timely payments as per the schedule...</p>
              <p><strong>3. Late Payment Penalty:</strong> Late payments will incur a penalty that goes to charity fund...</p>
              <p><strong>4. Default:</strong> In case of default, the organization has the right to take legal action...</p>
              <p><strong>5. Data Privacy:</strong> All personal information will be kept confidential...</p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Finalization;