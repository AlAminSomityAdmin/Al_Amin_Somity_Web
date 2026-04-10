// src/pages/settings/components/LoanSettings.tsx
import React from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface LoanSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const LoanSettings: React.FC<LoanSettingsProps> = ({ settings, updateSettings }) => {
  const handleLoanChange = (field: keyof typeof settings.loan, value: any) => {
    updateSettings({
      loan: { ...settings.loan, [field]: value }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Loan Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure loan rules, limits, interest rates, and approval processes
        </p>
      </div>

      <div className="p-6">
        {/* Loan Limits */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-amber-600">💰</span> Loan Limits & Amounts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Loan Amount <span className="text-gray-400">(BDT)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.minLoanAmount}
                onChange={(e) => handleLoanChange('minLoanAmount', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Lowest loan amount a member can request</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Loan Amount <span className="text-gray-400">(BDT)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.maxLoanAmount}
                onChange={(e) => handleLoanChange('maxLoanAmount', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Highest loan amount a member can request</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Loans Per Member
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.maxLoans}
                onChange={(e) => handleLoanChange('maxLoans', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum active loans a member can have</p>
            </div>
          </div>
        </div>

        {/* Interest & Duration */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">📈</span> Interest & Duration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Interest Rate <span className="text-gray-400">(%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.defaultInterestRate}
                onChange={(e) => handleLoanChange('defaultInterestRate', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Annual interest rate for loans</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Duration <span className="text-gray-400">(months)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.maxDuration}
                onChange={(e) => handleLoanChange('maxDuration', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum loan repayment period</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Duration <span className="text-gray-400">(months)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.minDuration || 1}
                onChange={(e) => handleLoanChange('minDuration', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum loan repayment period</p>
            </div>
          </div>
        </div>

        {/* Fees & Penalties */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-red-600">⚠️</span> Fees & Penalties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Fee <span className="text-gray-400">(%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.processingFee}
                onChange={(e) => handleLoanChange('processingFee', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Fee charged at loan disbursement</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Payment Penalty <span className="text-gray-400">(%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.latePaymentPenalty}
                onChange={(e) => handleLoanChange('latePaymentPenalty', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Additional charge for late payments</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Payment Grace Period <span className="text-gray-400">(days)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.latePaymentGraceDays || 7}
                onChange={(e) => handleLoanChange('latePaymentGraceDays', parseInt(e.target.value) || 7)}
              />
              <p className="text-xs text-gray-500 mt-1">Days allowed before penalty applies</p>
            </div>
          </div>
        </div>

        {/* Approval & Requirements */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-600">✓</span> Approval & Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Require Admin Approval</label>
                <p className="text-xs text-gray-500">All loan requests need admin approval</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.loan.approvalRequired}
                onChange={(e) => handleLoanChange('approvalRequired', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Require Guarantor</label>
                <p className="text-xs text-gray-500">Member must provide a guarantor for loans</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.loan.requireGuarantor}
                onChange={(e) => handleLoanChange('requireGuarantor', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Require Collateral</label>
                <p className="text-xs text-gray-500">Member must provide collateral for loans</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.loan.requireCollateral}
                onChange={(e) => handleLoanChange('requireCollateral', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Auto Approve for Good Standing</label>
                <p className="text-xs text-gray-500">Auto approve loans for members with good payment history</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.loan.autoApproveForGoodStanding || false}
                onChange={(e) => handleLoanChange('autoApproveForGoodStanding', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Eligibility Requirements */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">📋</span> Eligibility Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Membership Duration <span className="text-gray-400">(months)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.minMembershipDuration || 3}
                onChange={(e) => handleLoanChange('minMembershipDuration', parseInt(e.target.value) || 3)}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum time as member before loan eligibility</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Savings Required <span className="text-gray-400">(%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.minSavingsPercentage || 20}
                onChange={(e) => handleLoanChange('minSavingsPercentage', parseFloat(e.target.value) || 20)}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum savings as percentage of loan amount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Loan to Savings Ratio
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                value={settings.loan.maxLoanToSavingsRatio || 5}
                onChange={(e) => handleLoanChange('maxLoanToSavingsRatio', parseFloat(e.target.value) || 5)}
              />
              <p className="text-xs text-gray-500 mt-1">Max loan amount = savings × this ratio</p>
            </div>
          </div>
        </div>

        {/* Loan Calculation Summary */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Loan Calculation Example:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-amber-600">📊 Sample Loan: 10,000 BDT for 12 months</p>
              <div className="mt-2 space-y-1 text-gray-600">
                <p>• Interest: {settings.loan.defaultInterestRate}% = {settings.loan.defaultInterestRate * 100} BDT/year</p>
                <p>• Processing Fee: {settings.loan.processingFee}% = {settings.loan.processingFee * 100} BDT</p>
                <p>• Monthly Installment: ~{(10000 + (settings.loan.defaultInterestRate * 100)) / 12} BDT</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-amber-600">⚠️ Late Payment Example:</p>
              <div className="mt-2 space-y-1 text-gray-600">
                <p>• Monthly Due: 900 BDT</p>
                <p>• Late Penalty: {settings.loan.latePaymentPenalty}% = {settings.loan.latePaymentPenalty * 9} BDT</p>
                <p>• Total after penalty: 900 + {settings.loan.latePaymentPenalty * 9} BDT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Loan Approval Flow:</strong><br/>
            1. Member requests loan → 2. System checks eligibility → 3. Admin review (if required) → 
            4. Approval/Rejection → 5. Disbursement → 6. Installment tracking
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanSettings;