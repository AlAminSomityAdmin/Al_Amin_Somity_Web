// src/pages/Loans/AddLoan.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationSettings } from '../../context/OrganizationSettingsContext';
import Step1Applicant from '../../components/Loans/AddLoan/step1';
import Step2LoanType from '../../components/Loans/AddLoan/step2';
import Step3Finalization from '../../components/Loans/AddLoan/step3';
import type { LoanApplicantFormData } from '../../components/Loans/Application/ApplicantForm';
import { loanService } from '../../services/loanService';
import { toast } from 'sonner';

export interface LoanFormData {
  applicant: LoanApplicantFormData['applicant'];
  grantor: LoanApplicantFormData['grantor'];
  loanType: string;
  loanDetails: any;
  remarks?: string;
  documents: any[];
}

const initialFormData: Partial<LoanFormData> = {
  applicant: {
    isMember: false,
    name: '',
    phone: '',
    nid: '',
    address: '',
    occupation: '',
    monthlyIncome: 0,
    memberID: ''
  },
  grantor: {
    memberID: '',
    name: '',
    phone: '',
    relation: 'other'
  },
  documents: []
};

const AddLoan: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentOrganization } = useAuth();
  useOrganizationSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<LoanFormData>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const steps = [
    { number: 1, title: 'Applicant Information', description: 'Applicant & guarantor details' },
    { number: 2, title: 'Loan Details', description: 'Select loan type & provide details' },
    { number: 3, title: 'Finalization', description: 'Review, upload documents & submit' },
  ];

  const handleStep1Complete = (applicantData: LoanApplicantFormData) => {
    setFormData(prev => ({
      ...prev,
      applicant: applicantData.applicant,
      grantor: applicantData.grantor,
    }));
    setCurrentStep(2);
    setError('');
  };

  const handleStep2Complete = (loanType: string, loanDetails: any) => {
    setFormData(prev => ({
      ...prev,
      loanType,
      loanDetails,
    }));
    setCurrentStep(3);
    setError('');
  };

  const handleStep3Complete = async (finalData: { remarks?: string; documents: any[] }) => {
    if (!currentOrganization?.id) {
      toast.error('Organization not found');
      return;
    }

    if (!formData.applicant?.isMember && !formData.applicant?.name) {
      toast.error('Please provide applicant name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate loan amount based on loan type
      let amount = 0;
      if (formData.loanType === 'murabaha') {
        amount = Number(formData.loanDetails?.assetCost || 0);
      } else if (formData.loanType === 'musharaka' || formData.loanType === 'mudaraba') {
        amount = Number(formData.loanDetails?.totalCapital || 0);
      } else if (formData.loanType === 'qardHasanah') {
        amount = Number(formData.loanDetails?.loanAmount || 0);
      } else if (formData.loanType === 'salam') {
        amount = Number(formData.loanDetails?.totalPrice || 0);
      } else if (formData.loanType === 'ijarah') {
        amount = Number(formData.loanDetails?.assetValue || 0);
      } else if (formData.loanType === 'kafalah') {
        amount = Number(formData.loanDetails?.guaranteeAmount || 0);
      } else if (formData.loanType === 'istisna') {
        amount = Number(formData.loanDetails?.totalCost || 0);
      } else if (formData.loanType === 'tawarruq') {
        amount = Number(formData.loanDetails?.totalCost || 0);
      }

      if (amount <= 0) {
        toast.error('Please enter a valid loan amount');
        setLoading(false);
        return;
      }

      const applicationData = {
        applicant: {
          isMember: formData.applicant?.isMember || false,
          memberID: formData.applicant?.memberID || '',
          name: formData.applicant?.name || '',
          phone: formData.applicant?.phone || '',
          nid: formData.applicant?.nid || '',
          address: formData.applicant?.address || '',
          occupation: formData.applicant?.occupation || '',
          monthlyIncome: formData.applicant?.monthlyIncome || 0,
          email: formData.applicant?.email || '',
        },
        grantor: {
          memberID: formData.grantor?.memberID || '',
          name: formData.grantor?.name || '',
          phone: formData.grantor?.phone || '',
          relation: formData.grantor?.relation || '',
        },
        loanType: formData.loanType as string,
        loanDetails: {
          ...formData.loanDetails,
          requestedAmount: amount,
          requestedDuration: formData.loanDetails?.durationMonths || 12,
        },
        remarks: finalData.remarks,
        documents: finalData.documents,
        loanApplicationDate: new Date(),
        createdBy: user?.uid || 'system'
      };

      const applicationId = await loanService.createLoanApplication(currentOrganization.id, applicationData);
      
      toast.success(`✅ Loan application submitted successfully! Application ID: ${applicationId}`);
      navigate('/loans/applications');
    } catch (err: any) {
      console.error('Error creating loan application:', err);
      setError(err.message || 'Failed to submit application');
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    } else {
      navigate('/loans/list');
    }
  };

  const getStepProgress = () => {
    return (currentStep / steps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">New Loan Application</h1>
                <p className="text-gray-600">Apply for Islamic Shariah-compliant financing</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Step</div>
              <div className="text-lg font-semibold text-green-600">
                {currentStep} / {steps.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  Step {step.number}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentStep === step.number
                    ? 'border-green-500 bg-green-50'
                    : currentStep > step.number
                    ? 'border-green-300 bg-green-25'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep >= step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <div>
                <div className="font-semibold text-gray-800">Submitting application...</div>
                <div className="text-sm text-gray-600">Please wait</div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md">
          {currentStep === 1 && (
            <Step1Applicant
              onSubmit={handleStep1Complete}
              initialData={{
                applicant: formData.applicant,
                grantor: formData.grantor,
              }}
            />
          )}

          {currentStep === 2 && (
            <Step2LoanType
              onSubmit={handleStep2Complete}
              initialData={{
                loanType: formData.loanType,
                loanDetails: formData.loanDetails,
              }}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step3Finalization
              onSubmit={handleStep3Complete}
              formData={formData as LoanFormData}
              onBack={handleBack}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLoan;