// src/components/Loans/Application/LoanDetailsForm.tsx - SIMPLE VERSION
import React from 'react';
import type { LoanType } from '../../../types/loan';

// Import all individual forms
import MurabahaForm from './LoanDetails/MurabahaForm';
import IjarahForm from './LoanDetails/IjarahForm';
import MusharakaForm from './LoanDetails/MusharakaForm';
import SalamForm from './LoanDetails/SalamForm';
import QardHasanahForm from './LoanDetails/QardHasanahForm';
import IstisnaForm from './LoanDetails/IstisnaForm';
import MudarabaForm from './LoanDetails/MudarabaForm';
import TawarruqForm from './LoanDetails/TawarruqForm';
import KafalahForm from './LoanDetails/KafalahForm';

interface LoanDetailsFormProps {
  loanType: LoanType;
  onSubmit: (loanDetails: any) => void;
  onBack: () => void;
  initialData?: any;
}

const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({
  loanType,
  onSubmit,
  onBack,
  initialData
}) => {
  // Simple form mapping - কোন complexity নেই
  const renderForm = () => {
    switch (loanType) {
      case 'murabaha':
        return (
          <MurabahaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'ijarah':
        return (
          <IjarahForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'musharaka':
        return (
          <MusharakaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'salam':
        return (
          <SalamForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'qardHasanah':
        return (
          <QardHasanahForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'istisna':
        return (
          <IstisnaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'mudaraba':
        return (
          <MudarabaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'tawarruq':
        return (
          <TawarruqForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'kafalah':
        return (
          <KafalahForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      default:
        return <div>লোন টাইপ সিলেক্ট করুন</div>;
    }
  };

  return <div>{renderForm()}</div>;
};

export default LoanDetailsForm;