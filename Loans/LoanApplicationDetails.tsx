// src/pages/Loans/LoanApplicationDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loanService } from '../../services/loanService';
import { ArrowLeft, Loader2, CheckCircle, XCircle, User, Shield, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

const LoanApplicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrganization, user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    if (!currentOrganization?.id || !id) return;
    try {
      setLoading(true);
      const data = await loanService.getApplicationById(currentOrganization.id, id);
      setApplication(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!currentOrganization?.id || !application) return;
    setProcessing(true);
    try {
      await loanService.approveLoanApplication(
        currentOrganization.id,
        application.id,
        user?.uid || 'admin',
        10
      );
      toast.success('Loan approved successfully!');
      navigate('/loans/pending');
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentOrganization?.id || !application) return;
    setProcessing(true);
    try {
      await loanService.rejectLoanApplication(
        currentOrganization.id,
        application.id,
        user?.uid || 'admin',
        'Rejected by admin'
      );
      toast.success('Loan rejected');
      navigate('/loans/pending');
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  const calculateAmount = () => {
    const details = application?.loanDetails;
    switch (application?.loanType) {
      case 'murabaha': return details?.assetCost || 0;
      case 'musharaka': case 'mudaraba': return details?.totalCapital || 0;
      case 'qardHasanah': return details?.loanAmount || 0;
      default: return details?.amount || 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Application not found</p>
        <button onClick={() => navigate('/loans/pending')} className="mt-2 text-blue-600 hover:text-blue-700">
          Back to Pending List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button onClick={() => navigate('/loans/pending')} className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Pending List
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-5 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Loan Application</h1>
                <p className="text-yellow-100 text-sm mt-1">ID: {application.applicationId}</p>
              </div>
              <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" /> PENDING
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Applicant Info */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Applicant Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{application.applicant?.name}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p>{application.applicant?.phone}</p></div>
                <div><p className="text-xs text-gray-500">Member ID</p><p className="font-mono">{application.applicant?.memberID || 'Non-Member'}</p></div>
                {application.applicant?.monthlyIncome > 0 && (
                  <div><p className="text-xs text-gray-500">Monthly Income</p><p>৳{application.applicant?.monthlyIncome?.toLocaleString()}</p></div>
                )}
              </div>
            </div>

            {/* Guarantor Info */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Guarantor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{application.grantor?.name}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p>{application.grantor?.phone}</p></div>
                <div><p className="text-xs text-gray-500">Relation</p><p className="capitalize">{application.grantor?.relation}</p></div>
                <div><p className="text-xs text-gray-500">Member ID</p><p className="font-mono">{application.grantor?.memberID}</p></div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Loan Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-gray-500">Loan Type</p><p className="capitalize font-medium">{application.loanType}</p></div>
                <div><p className="text-xs text-gray-500">Amount</p><p className="text-xl font-bold text-green-600">৳{calculateAmount().toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-500">Duration</p><p>{application.loanDetails?.durationMonths || 12} months</p></div>
              </div>
              {application.loanDetails?.purpose && (
                <div className="mt-3"><p className="text-xs text-gray-500">Purpose</p><p>{application.loanDetails.purpose}</p></div>
              )}
              {application.remarks && (
                <div className="mt-3 bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Remarks</p>
                  <p className="text-sm">{application.remarks}</p>
                </div>
              )}
            </div>

            {/* Calculation Preview */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Loan Calculation Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-600">Principal:</span><div className="font-semibold">৳{calculateAmount().toLocaleString()}</div></div>
                <div><span className="text-gray-600">Interest (10%):</span><div className="font-semibold">৳{Math.round(calculateAmount() * 0.1).toLocaleString()}</div></div>
                <div><span className="text-gray-600">Total Payable:</span><div className="font-semibold text-green-600">৳{Math.round(calculateAmount() * 1.1).toLocaleString()}</div></div>
                <div><span className="text-gray-600">Monthly Payment:</span><div className="font-semibold text-blue-600">৳{Math.round(calculateAmount() * 1.1 / (application.loanDetails?.durationMonths || 12)).toLocaleString()}</div></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button onClick={handleReject} disabled={processing} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject Application
              </button>
              <button onClick={handleApprove} disabled={processing} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approve Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationDetails;