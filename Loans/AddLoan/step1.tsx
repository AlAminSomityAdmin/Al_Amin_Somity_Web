// src/components/Loans/AddLoan/Step1Applicant.tsx
import React from 'react';
import LoanApplicantForm, { 
  type LoanApplicantFormData 
} from '../Application/ApplicantForm';

interface Step1ApplicantProps {
  onSubmit: (data: LoanApplicantFormData) => void;
  initialData?: Partial<LoanApplicantFormData>;
}

const Step1Applicant: React.FC<Step1ApplicantProps> = ({ 
  onSubmit, 
  initialData 
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">ধাপ ১: আবেদনকারী তথ্য</h2>
        <p className="text-gray-600">
          আবেদনকারী এবং গ্যারান্টরের তথ্য সংগ্রহ করুন। সদস্য বা অ-সদস্য যেকোনো হতে পারেন।
        </p>
      </div>

      <LoanApplicantForm 
        onSubmit={onSubmit}
        initialData={initialData}
      />

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">গুরুত্বপূর্ণ তথ্য</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>গ্যারান্টর অবশ্যই সদস্য হতে হবে</li>
          <li>আবেদনকারী এবং গ্যারান্টর একই ব্যক্তি হতে পারবে না</li>
          <li>সকল তথ্য সঠিক এবং পূর্ণতা প্রদান করুন</li>
        </ul>
      </div>
    </div>
  );
};

export default Step1Applicant;