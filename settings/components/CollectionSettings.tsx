// src/pages/settings/components/CollectionSettings.tsx
import React from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface CollectionSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const CollectionSettings: React.FC<CollectionSettingsProps> = ({ settings, updateSettings }) => {
  const handleCollectionChange = (field: keyof typeof settings.collection, value: any) => {
    updateSettings({
      collection: { ...settings.collection, [field]: value }
    });
  };

  const togglePaymentMethod = (method: string, checked: boolean) => {
    const currentMethods = settings.collection.allowedPaymentMethods;
    let newMethods: any[];
    if (checked) {
      newMethods = [...currentMethods, method];
    } else {
      newMethods = currentMethods.filter(m => m !== method);
    }
    handleCollectionChange('allowedPaymentMethods', newMethods);
  };

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: '💵', description: 'Physical cash payment' },
    { id: 'bank', name: 'Bank', icon: '🏦', description: 'Bank transfer / deposit' },
    { id: 'bikash', name: 'bKash', icon: '📱', description: 'bKash mobile banking' },
    { id: 'nogod', name: 'Nagad', icon: '📱', description: 'Nagad mobile banking' },
    { id: 'rocket', name: 'Rocket', icon: '🚀', description: 'Rocket mobile banking' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Collection Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure payment methods, receipt preferences, and collection rules
        </p>
      </div>

      <div className="p-6">
        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-cyan-600">💳</span> Allowed Payment Methods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={settings.collection.allowedPaymentMethods.includes(method.id as any)}
                  onChange={(e) => togglePaymentMethod(method.id, e.target.checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">🧾</span> Receipt Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Auto-generate Receipt</label>
                <p className="text-xs text-gray-500">Automatically generate receipt numbers for payments</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.collection.autoGenerateReceipt}
                onChange={(e) => handleCollectionChange('autoGenerateReceipt', e.target.checked)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Prefix
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                value={settings.collection.receiptPrefix}
                onChange={(e) => handleCollectionChange('receiptPrefix', e.target.value)}
                placeholder="e.g., RCPT-, INV-"
              />
              <p className="text-xs text-gray-500 mt-1">Example: {settings.collection.receiptPrefix}001</p>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Footer Message
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                value={settings.collection.receiptFooter || ''}
                onChange={(e) => handleCollectionChange('receiptFooter', e.target.value)}
                placeholder="Thank you for your payment. Keep this receipt for future reference."
              />
              <p className="text-xs text-gray-500 mt-1">Optional message printed on all receipts</p>
            </div>
          </div>
        </div>

        {/* Collection Rules */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">📋</span> Collection Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Payment Amount <span className="text-gray-400">(BDT)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.collection.minPaymentAmount || 100}
                onChange={(e) => handleCollectionChange('minPaymentAmount', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum amount allowed for partial payments</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Payment Amount <span className="text-gray-400">(BDT)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.collection.maxPaymentAmount || 1000000}
                onChange={(e) => handleCollectionChange('maxPaymentAmount', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum amount allowed per transaction</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Allow Partial Payments</label>
                <p className="text-xs text-gray-500">Allow members to pay partial monthly fees</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.collection.allowPartialPayments || true}
                onChange={(e) => handleCollectionChange('allowPartialPayments', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Allow Advance Payment</label>
                <p className="text-xs text-gray-500">Allow members to pay future months in advance</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.collection.allowAdvancePayment || true}
                onChange={(e) => handleCollectionChange('allowAdvancePayment', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Require Payment Note</label>
                <p className="text-xs text-gray-500">Require members to add note for payments</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.collection.requirePaymentNote || false}
                onChange={(e) => handleCollectionChange('requirePaymentNote', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Send SMS Confirmation</label>
                <p className="text-xs text-gray-500">Send SMS after successful payment</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.collection.sendSmsConfirmation || true}
                onChange={(e) => handleCollectionChange('sendSmsConfirmation', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Collection Schedule */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-orange-600">📅</span> Collection Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Start Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.collection.collectionStartTime || '09:00'}
                onChange={(e) => handleCollectionChange('collectionStartTime', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection End Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.collection.collectionEndTime || '17:00'}
                onChange={(e) => handleCollectionChange('collectionEndTime', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Days
              </label>
              <select
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.collection.collectionDays || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleCollectionChange('collectionDays', values);
                }}
              >
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple days</p>
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-red-600">🔔</span> Payment Reminders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Reminder Before Due <span className="text-gray-400">(days)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.collection.reminderBeforeDays || 3}
                onChange={(e) => handleCollectionChange('reminderBeforeDays', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Reminder After Due <span className="text-gray-400">(days)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.collection.reminderAfterDays || 7}
                onChange={(e) => handleCollectionChange('reminderAfterDays', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMS Reminder</label>
                <p className="text-xs text-gray-500">Send SMS reminders for pending payments</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.collection.smsReminder || true}
                onChange={(e) => handleCollectionChange('smsReminder', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Reminder</label>
                <p className="text-xs text-gray-500">Send email reminders for pending payments</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.collection.emailReminder || true}
                onChange={(e) => handleCollectionChange('emailReminder', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Collection Summary */}
        <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📊 Collection Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Enabled Payment Methods:</span>
                <span className="font-medium">{settings.collection.allowedPaymentMethods.length} / 5</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Receipt Format:</span>
                <span className="font-medium">{settings.collection.receiptPrefix}[number]</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Partial Payments:</span>
                <span className="font-medium">{settings.collection.allowPartialPayments ? '✅ Allowed' : '❌ Not Allowed'}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Collection Hours:</span>
                <span className="font-medium">{settings.collection.collectionStartTime || '09:00'} - {settings.collection.collectionEndTime || '17:00'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Reminders:</span>
                <span className="font-medium">{settings.collection.reminderBeforeDays || 3} days before, {settings.collection.reminderAfterDays || 7} days after</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Receipt Footer:</span>
                <span className="font-medium truncate max-w-[200px]">{settings.collection.receiptFooter || 'Not set'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionSettings;