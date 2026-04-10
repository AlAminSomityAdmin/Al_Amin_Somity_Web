// src/pages/settings/components/MemberSettings.tsx
import React from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface MemberSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const MemberSettings: React.FC<MemberSettingsProps> = ({ settings, updateSettings }) => {
  const handleMemberChange = (field: keyof typeof settings.member, value: any) => {
    updateSettings({
      member: { ...settings.member, [field]: value }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Member Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure member registration, ID generation, and approval rules
        </p>
      </div>

      <div className="p-6">
        {/* Member ID Configuration */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-600">🆔</span> Member ID Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ID Prefix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member ID Prefix
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={settings.member.memberIdPrefix}
                onChange={(e) => handleMemberChange('memberIdPrefix', e.target.value)}
                placeholder="e.g., AM-, MBR-"
              />
              <p className="text-xs text-gray-500 mt-1">Example: {settings.member.memberIdPrefix}001</p>
            </div>

            {/* ID Digit Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Digit Length
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.member.memberIdDigitLength || 3}
                onChange={(e) => handleMemberChange('memberIdDigitLength', parseInt(e.target.value))}
              >
                <option value="3">3 digits (001, 002...)</option>
                <option value="4">4 digits (0001, 0002...)</option>
                <option value="5">5 digits (00001, 00002...)</option>
                <option value="6">6 digits (000001, 000002...)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Number of digits in the sequential part</p>
            </div>

            {/* Auto Generate */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Auto Generate Member ID</label>
                <p className="text-xs text-gray-500">Automatically generate IDs for new members</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.member.autoGenerateMemberId}
                onChange={(e) => handleMemberChange('autoGenerateMemberId', e.target.checked)}
              />
            </div>
          </div>

          {/* ID Preview */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Preview Member ID Format:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-mono">
                {settings.member.memberIdPrefix}001
              </span>
              <span className="text-gray-400">→</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-mono">
                {settings.member.memberIdPrefix}002
              </span>
              <span className="text-gray-400">→</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-mono">
                {settings.member.memberIdPrefix}003
              </span>
              <span className="text-gray-400">...</span>
            </div>
          </div>
        </div>

        {/* Member Approval Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-orange-600">✓</span> Registration & Approval
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Require Admin Approval</label>
                <p className="text-xs text-gray-500">New members need admin approval before activation</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.member.requireApproval}
                onChange={(e) => handleMemberChange('requireApproval', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Auto Activate After Approval</label>
                <p className="text-xs text-gray-500">Automatically activate member upon approval</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.member.autoActivateAfterApproval || true}
                onChange={(e) => handleMemberChange('autoActivateAfterApproval', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Member Roles & Permissions */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">👥</span> Member Roles & Default Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Member Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.member.defaultRole || 'member'}
                onChange={(e) => handleMemberChange('defaultRole', e.target.value)}
              >
                <option value="member">General Member</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="accountant">Accountant</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Default role for new members</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Member Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.member.defaultStatus || 'active'}
                onChange={(e) => handleMemberChange('defaultStatus', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Initial status for new members</p>
            </div>
          </div>
        </div>

        {/* Member Rules */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-red-600">📋</span> Member Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Age Required <span className="text-gray-400">(years)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.member.minAge || 18}
                onChange={(e) => handleMemberChange('minAge', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Members <span className="text-gray-400">(Plan Limit: {settings.member.planMaxMembers || 'Unlimited'})</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                value={settings.member.planMaxMembers || 'Unlimited'}
                disabled
              />
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ This limit is set by your subscription plan. Contact super admin to upgrade.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Inactive After <span className="text-gray-400">(days without payment)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.member.inactiveAfterDays || 90}
                onChange={(e) => handleMemberChange('inactiveAfterDays', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Auto deactivate members after this many days without payment</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Deletion After <span className="text-gray-400">(days inactive)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.member.deleteAfterDays || 365}
                onChange={(e) => handleMemberChange('deleteAfterDays', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Auto delete members after being inactive for this long</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> Maximum member limit is controlled by your organization's subscription plan.
            Current plan allows up to <strong>{settings.member.planMaxMembers || 'Unlimited'}</strong> members.
            Contact super admin to upgrade your plan for more members.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberSettings;