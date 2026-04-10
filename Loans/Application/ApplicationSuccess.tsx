// src/components/Loans/Application/ApplicationSuccess.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, Download } from 'lucide-react';

interface ApplicationSuccessProps {
  applicationId: string;
  loanId: string;
}

const ApplicationSuccess: React.FC<ApplicationSuccessProps> = ({ applicationId, loanId }) => {
  const navigate = useNavigate();

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // Generate PDF logic here
    alert('PDF download feature coming soon');
  };

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">আবেদন সফলভাবে জমা হয়েছে!</h2>
      <p className="text-gray-600 mb-4">আপনার লোন আবেদনটি সফলভাবে জমা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।</p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6 inline-block">
        <p className="text-sm text-gray-500">আবেদন আইডি</p>
        <p className="text-lg font-mono font-bold">{applicationId}</p>
        <p className="text-sm text-gray-500 mt-2">লোন আইডি</p>
        <p className="text-lg font-mono font-bold">{loanId}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><Printer className="h-4 w-4" /> প্রিন্ট</button>
        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Download className="h-4 w-4" /> ডাউনলোড</button>
        <button onClick={() => navigate('/loans/list')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">লোন লিস্টে যান</button>
      </div>
    </div>
  );
};

export default ApplicationSuccess;