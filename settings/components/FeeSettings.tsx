// src/pages/settings/components/FeeSettings.tsx
import React from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface FeeSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const FeeSettings: React.FC<FeeSettingsProps> = ({ settings, updateSettings }) => {
  const handleFeeChange = (field: keyof typeof settings.fee, value: any) => {
    updateSettings({
      fee: { ...settings.fee, [field]: value }
    });
  };

  const monthlyFeePerMember = settings.fee.amountPerShare * settings.share.defaultShare;
  const yearlyFeePerMember = monthlyFeePerMember * 12;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Fee Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure monthly fees, late payment penalties, and collection schedules
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fee Collection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Frequency
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={settings.fee.type}
              onChange={(e) => handleFeeChange('type', e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How often fees are collected</p>
          </div>

          {/* Fee Amount Per Share */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee per Share <span className="text-gray-400">(BDT)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={settings.fee.amountPerShare}
              onChange={(e) => handleFeeChange('amountPerShare', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Fee amount for each share</p>
          </div>

          {/* Due Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Day
            </label>
            <input
              type="number"
              min="1"
              max={settings.fee.type === 'monthly' ? '31' : '7'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={settings.fee.dueDay}
              onChange={(e) => handleFeeChange('dueDay', parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Day of {settings.fee.type === 'monthly' ? 'month' : 'week'} when fees are due
            </p>
          </div>

          {/* Grace Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grace Period <span className="text-gray-400">(days)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={settings.fee.gracePeriod}
              onChange={(e) => handleFeeChange('gracePeriod', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Days allowed after due date without penalty</p>
          </div>

          {/* Late Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Late Fee <span className="text-gray-400">(BDT)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={settings.fee.lateFee}
              onChange={(e) => handleFeeChange('lateFee', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Penalty for late payment</p>
          </div>

          {/* Apply Late Fee After */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply Late Fee After <span className="text-gray-400">(days)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={settings.fee.lateFeeAfterDays}
              onChange={(e) => handleFeeChange('lateFeeAfterDays', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Days after due date when late fee applies</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-xs text-green-600 font-medium">MONTHLY FEE (per member)</p>
            <p className="text-2xl font-bold text-green-900 mt-1">BDT {monthlyFeePerMember.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{settings.share.defaultShare} share × BDT {settings.fee.amountPerShare}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium">YEARLY FEE (per member)</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">BDT {yearlyFeePerMember.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">Monthly fee × 12 months</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <p className="text-xs text-red-600 font-medium">LATE PENALTY</p>
            <p className="text-2xl font-bold text-red-900 mt-1">BDT {settings.fee.lateFee}</p>
            <p className="text-xs text-red-600 mt-1">Applied after {settings.fee.lateFeeAfterDays} days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeSettings;