// src/pages/settings/components/ShareSettings.tsx
import React from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface ShareSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const ShareSettings: React.FC<ShareSettingsProps> = ({ settings, updateSettings }) => {
  const handleShareChange = (field: keyof typeof settings.share, value: number) => {
    updateSettings({
      share: { ...settings.share, [field]: value }
    });
  };

  const monthlyFee = settings.share.perShareValue * settings.share.defaultShare;
  const minMonthlyFee = settings.share.perShareValue * settings.share.minShare;
  const maxMonthlyFee = settings.share.perShareValue * settings.share.maxShare;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Member Share Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure member shares and monthly fees. Each share determines the monthly fee amount.
        </p>
      </div>

      <div className="p-6">
        {/* Info Box */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>How Member Share Works:</strong> Each member has a certain number of shares. 
            Monthly fee = Share count × Per share fee. Members can increase their shares to pay higher monthly fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Per Share Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Per Share Fee <span className="text-gray-400">(BDT/month)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.share.perShareValue}
              onChange={(e) => handleShareChange('perShareValue', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Monthly fee for each share</p>
          </div>

          {/* Default Shares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Shares <span className="text-gray-400">(per new member)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.share.defaultShare}
              onChange={(e) => handleShareChange('defaultShare', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Number of shares new members receive by default</p>
          </div>

          {/* Minimum Shares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Shares <span className="text-gray-400">(per member)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.share.minShare}
              onChange={(e) => handleShareChange('minShare', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum number of shares a member must have</p>
          </div>

          {/* Maximum Shares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Shares <span className="text-gray-400">(per member)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.share.maxShare}
              onChange={(e) => handleShareChange('maxShare', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Maximum number of shares a member can have</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium">MINIMUM MONTHLY FEE</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">BDT {minMonthlyFee.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">{settings.share.minShare} share × BDT {settings.share.perShareValue}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-xs text-green-600 font-medium">DEFAULT MONTHLY FEE</p>
            <p className="text-2xl font-bold text-green-900 mt-1">BDT {monthlyFee.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{settings.share.defaultShare} share × BDT {settings.share.perShareValue}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="text-xs text-purple-600 font-medium">MAXIMUM MONTHLY FEE</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">BDT {maxMonthlyFee.toLocaleString()}</p>
            <p className="text-xs text-purple-600 mt-1">{settings.share.maxShare} share × BDT {settings.share.perShareValue}</p>
          </div>
        </div>

        {/* Member Examples */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Member Examples:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">Member with 1 share:</span>
              <span className="font-medium">BDT {settings.share.perShareValue} / month</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">Member with 2 shares:</span>
              <span className="font-medium">BDT {settings.share.perShareValue * 2} / month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Member with {settings.share.maxShare} shares:</span>
              <span className="font-medium">BDT {maxMonthlyFee} / month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSettings;