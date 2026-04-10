// src/pages/settings/components/InvestmentSettings.tsx
import React from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface InvestmentSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const InvestmentSettings: React.FC<InvestmentSettingsProps> = ({ settings, updateSettings }) => {
  const handleInvestmentChange = (field: keyof typeof settings.investment, value: any) => {
    updateSettings({
      investment: { ...settings.investment, [field]: value }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Investment Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure project-based investment system (separate from member shares)
        </p>
      </div>

      <div className="p-6">
        {/* Info Box */}
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            💡 <strong>What is Investment System?</strong> This is separate from member shares. 
            Members (or external investors) can invest in specific projects and earn profits based on their investment amount.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enable Investment */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enable Investment System</label>
              <p className="text-xs text-gray-500">Allow members to invest in projects</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={settings.investment.enabled}
              onChange={(e) => handleInvestmentChange('enabled', e.target.checked)}
            />
          </div>

          {/* Allow External Investors */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Allow External Investors</label>
              <p className="text-xs text-gray-500">Allow non-members to invest</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={settings.investment.allowExternalInvestors}
              onChange={(e) => handleInvestmentChange('allowExternalInvestors', e.target.checked)}
            />
          </div>

          {/* Min Investment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Investment <span className="text-gray-400">(BDT)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={settings.investment.minInvestmentAmount}
              onChange={(e) => handleInvestmentChange('minInvestmentAmount', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Max Investment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Investment <span className="text-gray-400">(BDT)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={settings.investment.maxInvestmentAmount}
              onChange={(e) => handleInvestmentChange('maxInvestmentAmount', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Profit Distribution Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profit Distribution Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={settings.investment.profitDistributionType}
              onChange={(e) => handleInvestmentChange('profitDistributionType', e.target.value as 'percentage' | 'fixed')}
            >
              <option value="percentage">Percentage Based</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          {/* Default Profit Share */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Profit Share <span className="text-gray-400">(%)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={settings.investment.defaultProfitShareRatio}
              onChange={(e) => handleInvestmentChange('defaultProfitShareRatio', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Require Approval */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Require Admin Approval</label>
              <p className="text-xs text-gray-500">All investments need admin approval</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={settings.investment.requireApproval}
              onChange={(e) => handleInvestmentChange('requireApproval', e.target.checked)}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Investment vs Member Share - Key Difference:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-blue-600">🏦 Member Share</p>
              <p className="text-gray-600 text-xs mt-1">• Monthly fee payment</p>
              <p className="text-gray-600 text-xs">• Determines regular contribution</p>
              <p className="text-gray-600 text-xs">• 1 share = fixed monthly fee</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-purple-600">📈 Investment</p>
              <p className="text-gray-600 text-xs mt-1">• Project-based profit sharing</p>
              <p className="text-gray-600 text-xs">• One-time or project-specific</p>
              <p className="text-gray-600 text-xs">• Returns based on project profit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSettings;