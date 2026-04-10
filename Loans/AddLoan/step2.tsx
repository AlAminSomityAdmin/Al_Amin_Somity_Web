// src/components/Loans/AddLoan/Step2LoanType.tsx
import React, { useState } from 'react';
import { useOrganizationSettings } from '../../../context/OrganizationSettingsContext';
import LoanTypeSelection from '../Application/LoanTypeSelection';
import MurabahaForm from '../Application/LoanDetails/MurabahaForm';
import MusharakaForm from '../Application/LoanDetails/MusharakaForm';
import MudarabaForm from '../Application/LoanDetails/MudarabaForm';
import SalamForm from '../Application/LoanDetails/SalamForm';
import IjarahForm from '../Application/LoanDetails/IjarahForm';
import IstisnaForm from '../Application/LoanDetails/IstisnaForm';
import KafalahForm from '../Application/LoanDetails/KafalahForm';
import QardHasanahForm from '../Application/LoanDetails/QardHasanahForm';
import TawarruqForm from '../Application/LoanDetails/TawarruqForm';

interface Step2LoanTypeProps {
  onSubmit: (loanType: string, loanDetails: any) => void;
  initialData?: { loanType?: string; loanDetails?: any };
  onBack: () => void;
}

const Step2LoanType: React.FC<Step2LoanTypeProps> = ({ onSubmit, initialData, onBack }) => {
  useOrganizationSettings();
  const [selectedLoanType, setSelectedLoanType] = useState<string | undefined>(initialData?.loanType);
  const [loanDetails, setLoanDetails] = useState<any>(initialData?.loanDetails || {});

  const handleLoanTypeSelect = (loanType: string) => {
    setSelectedLoanType(loanType);
    setLoanDetails({});
  };

  const handleLoanDetailsSubmit = (details: any) => {
    if (selectedLoanType) {
      onSubmit(selectedLoanType, details);
    }
  };

  const handleBackToTypeSelection = () => {
    setSelectedLoanType(undefined);
  };

  const renderLoanForm = () => {
    if (!selectedLoanType) return null;
    
    const commonProps = { 
      onSubmit: handleLoanDetailsSubmit, 
      onBack: handleBackToTypeSelection,  // 👈 This goes back to type selection, NOT to step 1
      initialData: loanDetails 
    };
    
    switch (selectedLoanType) {
      case 'murabaha': return <MurabahaForm {...commonProps} />;
      case 'musharaka': return <MusharakaForm {...commonProps} />;
      case 'mudaraba': return <MudarabaForm {...commonProps} />;
      case 'salam': return <SalamForm {...commonProps} />;
      case 'ijarah': return <IjarahForm {...commonProps} />;
      case 'istisna': return <IstisnaForm {...commonProps} />;
      case 'kafalah': return <KafalahForm {...commonProps} />;
      case 'qardHasanah': return <QardHasanahForm {...commonProps} />;
      case 'tawarruq': return <TawarruqForm {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className="p-6">
      {!selectedLoanType ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Step 2: Select Loan Type</h2>
            <p className="text-gray-600">Choose the Islamic financing product that suits your needs</p>
          </div>
          <LoanTypeSelection onSelect={handleLoanTypeSelect} selectedType={selectedLoanType} />
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Applicant
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Loan Details</h2>
              <p className="text-gray-600">Provide details for your selected loan type</p>
            </div>
            <button
              onClick={handleBackToTypeSelection}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              ← Change Loan Type
            </button>
          </div>
          {renderLoanForm()}
        </>
      )}
    </div>
  );
};

export default Step2LoanType;