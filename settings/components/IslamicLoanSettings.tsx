// src/pages/settings/components/IslamicLoanSettings.tsx
import React, { useState } from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface IslamicLoanSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const IslamicLoanSettings: React.FC<IslamicLoanSettingsProps> = ({ settings, updateSettings }) => {
  const [activeLoanType, setActiveLoanType] = useState('murabaha');

  const updateLoanConfig = (type: string, field: string, value: any) => {
    updateSettings({
      islamicLoanConfig: {
        ...settings.islamicLoanConfig,
        [type]: {
          ...settings.islamicLoanConfig[type as keyof typeof settings.islamicLoanConfig],
          [field]: value
        }
      }
    });
  };

  const toggleLoanType = (type: string, enabled: boolean) => {
    updateSettings({
      islamicLoanConfig: {
        ...settings.islamicLoanConfig,
        [type]: {
          ...settings.islamicLoanConfig[type as keyof typeof settings.islamicLoanConfig],
          enabled
        }
      }
    });
  };

  const loanTypes = [
    { id: 'murabaha', name: 'মুরাবাহা', english: 'Murabaha', icon: '🛒', description: 'পণ্য ক্রয়-বিক্রয় ভিত্তিক লোন', color: 'blue' },
    { id: 'musharaka', name: 'মুশারাকা', english: 'Musharaka', icon: '🤝', description: 'যৌথ অংশিদারিত্ব ভিত্তিক লোন', color: 'green' },
    { id: 'salam', name: 'সালাম', english: 'Salam', icon: '🌾', description: 'অগ্রিম পেমেন্ট ভিত্তিক কৃষি লোন', color: 'orange' },
    { id: 'qardHasanah', name: 'কারদ হাসানা', english: 'Qard Hasanah', icon: '❤️', description: 'বিনা সুদে হাসানা লোন', color: 'red' },
    { id: 'istisna', name: 'ইস্তিসনা', english: 'Istisna', icon: '🏗️', description: 'ম্যানুফ্যাকচারিং/কনস্ট্রাকশন লোন', color: 'purple' },
    { id: 'mudaraba', name: 'মুদারাবা', english: 'Mudaraba', icon: '💰', description: 'মুদ্রা বিনিয়োগ ভিত্তিক লোন', color: 'teal' },
    { id: 'tawarruq', name: 'তাওয়ারুক', english: 'Tawarruq', icon: '⚖️', description: 'পণ্য মাধ্যমে তরলতা লোন', color: 'indigo' },
    { id: 'ijarah', name: 'ইজারা', english: 'Ijarah', icon: '🏠', description: 'লিজ ভিত্তিক লোন', color: 'pink' },
    { id: 'kafalah', name: 'কাফালা', english: 'Kafalah', icon: '🛡️', description: 'গ্যারান্টি ভিত্তিক লোন', color: 'yellow' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Islamic Loan Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure Shariah-compliant loan products and their parameters
        </p>
      </div>

      <div className="p-6">
        {/* Loan Type Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-1 -mb-px">
            {loanTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveLoanType(type.id)}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${activeLoanType === type.id
                    ? `border-${type.color}-600 text-${type.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{type.icon}</span>
                <span className="hidden sm:inline">{type.english}</span>
                <span className="sm:hidden">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content for each loan type */}
        <div className="mt-6">
          {/* Murabaha */}
          {activeLoanType === 'murabaha' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Murabaha</h3>
                  <p className="text-sm text-gray-600">Cost-plus financing for asset purchases</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={settings.islamicLoanConfig.murabaha.enabled}
                  onChange={(e) => toggleLoanType('murabaha', e.target.checked)}
                />
              </div>

              {settings.islamicLoanConfig.murabaha.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profit Rate <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.murabaha.profitRate}
                      onChange={(e) => updateLoanConfig('murabaha', 'profitRate', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Markup/Margin on cost price</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Duration <span className="text-gray-400">(months)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.murabaha.maxDuration}
                      onChange={(e) => updateLoanConfig('murabaha', 'maxDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Down Payment <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.murabaha.minDownPayment || 20}
                      onChange={(e) => updateLoanConfig('murabaha', 'minDownPayment', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Payment Penalty <span className="text-gray-400">(charity fund)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.murabaha.latePenalty || 2}
                      onChange={(e) => updateLoanConfig('murabaha', 'latePenalty', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Penalty goes to charity fund (not income)</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Musharaka */}
          {activeLoanType === 'musharaka' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Musharaka</h3>
                  <p className="text-sm text-gray-600">Joint partnership profit-sharing</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={settings.islamicLoanConfig.musharaka.enabled}
                  onChange={(e) => toggleLoanType('musharaka', e.target.checked)}
                />
              </div>

              {settings.islamicLoanConfig.musharaka.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Profit Share <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.musharaka.profitSharingRatio}
                      onChange={(e) => updateLoanConfig('musharaka', 'profitSharingRatio', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Organization's share of profit</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Duration <span className="text-gray-400">(months)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.musharaka.maxDuration}
                      onChange={(e) => updateLoanConfig('musharaka', 'maxDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loss Sharing Ratio <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.musharaka.lossSharingRatio || 100}
                      onChange={(e) => updateLoanConfig('musharaka', 'lossSharingRatio', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Losses shared based on capital contribution</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Management Fee <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.musharaka.managementFee || 1}
                      onChange={(e) => updateLoanConfig('musharaka', 'managementFee', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Salam */}
          {activeLoanType === 'salam' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Salam</h3>
                  <p className="text-sm text-gray-600">Advance payment for future delivery</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={settings.islamicLoanConfig.salam.enabled}
                  onChange={(e) => toggleLoanType('salam', e.target.checked)}
                />
              </div>

              {settings.islamicLoanConfig.salam.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Period <span className="text-gray-400">(months)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.salam.deliveryPeriod}
                      onChange={(e) => updateLoanConfig('salam', 'deliveryPeriod', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Advance <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.salam.maxAdvance}
                      onChange={(e) => updateLoanConfig('salam', 'maxAdvance', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commodity Type
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.salam.commodityType || 'Agricultural Products'}
                      onChange={(e) => updateLoanConfig('salam', 'commodityType', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penalty for Late Delivery <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.salam.deliveryPenalty || 1}
                      onChange={(e) => updateLoanConfig('salam', 'deliveryPenalty', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Qard Hasanah */}
          {activeLoanType === 'qardHasanah' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Qard Hasanah</h3>
                  <p className="text-sm text-gray-600">Interest-free benevolent loan</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={settings.islamicLoanConfig.qardHasanah.enabled}
                  onChange={(e) => toggleLoanType('qardHasanah', e.target.checked)}
                />
              </div>

              {settings.islamicLoanConfig.qardHasanah.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Fee <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.qardHasanah.serviceFee}
                      onChange={(e) => updateLoanConfig('qardHasanah', 'serviceFee', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Admin/service fee (not interest)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Amount <span className="text-gray-400">(BDT)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.qardHasanah.maxAmount}
                      onChange={(e) => updateLoanConfig('qardHasanah', 'maxAmount', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Duration <span className="text-gray-400">(months)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.qardHasanah.maxDuration}
                      onChange={(e) => updateLoanConfig('qardHasanah', 'maxDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Consideration
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.qardHasanah.specialConsideration || 'all'}
                      onChange={(e) => updateLoanConfig('qardHasanah', 'specialConsideration', e.target.value)}
                    >
                      <option value="all">All Members</option>
                      <option value="needy">Only Needy Members</option>
                      <option value="emergency">Emergency Cases Only</option>
                      <option value="committee">Committee Approval Required</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ijarah */}
          {activeLoanType === 'ijarah' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Ijarah</h3>
                  <p className="text-sm text-gray-600">Lease-based financing</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={settings.islamicLoanConfig.ijarah.enabled}
                  onChange={(e) => toggleLoanType('ijarah', e.target.checked)}
                />
              </div>

              {settings.islamicLoanConfig.ijarah.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rental Rate <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.ijarah.rentalRate}
                      onChange={(e) => updateLoanConfig('ijarah', 'rentalRate', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Monthly rental rate percentage</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.ijarah.securityDeposit}
                      onChange={(e) => updateLoanConfig('ijarah', 'securityDeposit', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Duration <span className="text-gray-400">(months)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.ijarah.maxDuration}
                      onChange={(e) => updateLoanConfig('ijarah', 'maxDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Responsibility
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.ijarah.maintenanceResponsibility || 'lessee'}
                      onChange={(e) => updateLoanConfig('ijarah', 'maintenanceResponsibility', e.target.value)}
                    >
                      <option value="lessee">Lessee (Member)</option>
                      <option value="lessor">Lessor (Organization)</option>
                      <option value="shared">Shared</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kafalah */}
          {activeLoanType === 'kafalah' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Kafalah</h3>
                  <p className="text-sm text-gray-600">Guarantee-based financing</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={settings.islamicLoanConfig.kafalah.enabled}
                  onChange={(e) => toggleLoanType('kafalah', e.target.checked)}
                />
              </div>

              {settings.islamicLoanConfig.kafalah.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guarantee Fee <span className="text-gray-400">(%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.kafalah.guaranteeFee}
                      onChange={(e) => updateLoanConfig('kafalah', 'guaranteeFee', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Guarantee Amount <span className="text-gray-400">(BDT)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.kafalah.maxGuaranteeAmount}
                      onChange={(e) => updateLoanConfig('kafalah', 'maxGuaranteeAmount', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Guarantor's Savings
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.kafalah.minGuarantorSavings || 10000}
                      onChange={(e) => updateLoanConfig('kafalah', 'minGuarantorSavings', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Guarantors
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.islamicLoanConfig.kafalah.maxGuarantors || 2}
                      onChange={(e) => updateLoanConfig('kafalah', 'maxGuarantors', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* General Islamic Loan Rules */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📜 General Islamic Loan Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked readOnly />
                <span>No interest (Riba) in any form</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked readOnly />
                <span>All contracts must be in writing</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked readOnly />
                <span>Asset-backed financing preferred</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked readOnly />
                <span>Penalties go to charity, not income</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked readOnly />
                <span>Risk and reward sharing principle</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked readOnly />
                <span>No investment in haram activities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslamicLoanSettings;