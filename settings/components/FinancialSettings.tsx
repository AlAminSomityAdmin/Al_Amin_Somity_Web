// src/pages/settings/components/FinancialSettings.tsx
import React, { useState, useMemo } from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface FinancialSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const FinancialSettings: React.FC<FinancialSettingsProps> = ({ settings, updateSettings }) => {
  const handleFinancialChange = (field: keyof typeof settings.financial, value: any) => {
    updateSettings({
      financial: { ...settings.financial, [field]: value }
    });
  };

  // Get start date from settings or default to July 2021
  const getStartDate = () => {
    if (settings.financial?.fiscalYearStart) {
      const [month, year] = settings.financial.fiscalYearStart.split('-');
      return { month: month || 'July', year: parseInt(year) || 2021 };
    }
    return { month: 'July', year: 2021 };
  };

  const startDate = getStartDate();
  
  const [selectedMonth, setSelectedMonth] = useState(startDate.month);
  const [selectedYear, setSelectedYear] = useState(startDate.year);

  const updateFiscalYear = (month: string, year: number) => {
    const fiscalYearString = `${month}-${year}`;
    handleFinancialChange('fiscalYearStart', fiscalYearString);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const months = [
    { value: 'January', name: 'Jan', fullName: 'January', days: 31 },
    { value: 'February', name: 'Feb', fullName: 'February', days: 28 },
    { value: 'March', name: 'Mar', fullName: 'March', days: 31 },
    { value: 'April', name: 'Apr', fullName: 'April', days: 30 },
    { value: 'May', name: 'May', fullName: 'May', days: 31 },
    { value: 'June', name: 'Jun', fullName: 'June', days: 30 },
    { value: 'July', name: 'Jul', fullName: 'July', days: 31 },
    { value: 'August', name: 'Aug', fullName: 'August', days: 31 },
    { value: 'September', name: 'Sep', fullName: 'September', days: 30 },
    { value: 'October', name: 'Oct', fullName: 'October', days: 31 },
    { value: 'November', name: 'Nov', fullName: 'November', days: 30 },
    { value: 'December', name: 'Dec', fullName: 'December', days: 31 }
  ];

  // Generate years from 2021 to current year + 5
  const currentYear = new Date().getFullYear();
  const startYearRange = 2021;
  const years = useMemo(() => {
    const yrs = [];
    for (let i = startYearRange; i <= currentYear + 5; i++) {
      yrs.push(i);
    }
    return yrs;
  }, [currentYear]);

  // Get current date
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentMonthObj = months[currentMonthIndex];
  const currentYearNum = now.getFullYear();
  const currentDay = now.getDate();

  // Get start month index
  const getStartMonthIndex = (monthName: string) => {
    return months.findIndex(m => m.value === monthName);
  };

  const startMonthIndex = getStartMonthIndex(selectedMonth);
  const startYearNum = selectedYear;

  // Calculate total months using DATEDIF style: =DATEDIF(startDate, currentDate, "M") + 1
  const totalMonths = useMemo(() => {
    // Calculate total months difference
    let monthsDiff = (currentYearNum - startYearNum) * 12;
    monthsDiff += (currentMonthIndex - startMonthIndex);
    // Add 1 to include current month
    const total = monthsDiff + 1;
    
    // Make sure it's not negative
    return total > 0 ? total : 1;
  }, [startYearNum, startMonthIndex, currentYearNum, currentMonthIndex]);

  // Format start date display (e.g., 2-Jul-2021)
  const startDateDisplay = useMemo(() => {
    const monthObj = months.find(m => m.value === selectedMonth);
    const startDay = 2; // Your somity started on 2nd July
    return `${startDay}-${monthObj?.name || 'Jul'}-${startYearNum}`;
  }, [selectedMonth, startYearNum]);

  // Format current date display (e.g., 1-Apr-2026)
  const currentDateDisplay = useMemo(() => {
    return `${currentDay}-${currentMonthObj?.name || 'Apr'}-${currentYearNum}`;
  }, [currentDay, currentMonthObj, currentYearNum]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Financial Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure currency, fiscal year, and financial preferences
        </p>
      </div>

      <div className="p-6">
        {/* Fiscal Year Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-indigo-600">📅</span> Organization Start Date
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="flex gap-3">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={selectedMonth}
                  onChange={(e) => updateFiscalYear(e.target.value, selectedYear)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.fullName} ({month.name})
                    </option>
                  ))}
                </select>
                <select
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={selectedYear}
                  onChange={(e) => updateFiscalYear(selectedMonth, parseInt(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When did your organization start its operations?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Date
              </label>
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-700 font-medium">
                  {currentDateDisplay}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Automatically detected from system date</p>
            </div>
          </div>

          {/* Organization Timeline Summary */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-indigo-800 mb-4 flex items-center gap-2">
              <span>📘</span> Organization Timeline
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Start Date:</span>{' '}
                  <strong className="text-indigo-700">{startDateDisplay}</strong>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Current Date:</span>{' '}
                  <strong className="text-green-700">{currentDateDisplay}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Total Months Completed:</span>{' '}
                  <strong className="text-blue-700 text-xl">{totalMonths}</strong>
                  <span className="text-gray-500 text-xs ml-1">months</span>
                </p>
                <p className="text-xs text-gray-500">
                  Formula: DATEDIF(Start, Current, "M") + 1
                </p>
                <p className="text-xs text-gray-500">
                  (Including current running month)
                </p>
              </div>
            </div>

            {/* Simple Summary Text */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-sm text-gray-700">
                📊 <strong>Fee Collection Cycle:</strong> From{' '}
                <span className="font-medium text-indigo-600">{startDateDisplay}</span> to{' '}
                <span className="font-medium text-green-600">{currentDateDisplay}</span>
                {' '}= Total <span className="font-bold text-blue-600">{totalMonths}</span> months
              </p>
            </div>
          </div>

          {/* Organization Info */}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 flex items-start gap-2">
              <span>🏢</span>
              <span>
                <strong>Organization Summary:</strong> Your organization started on{' '}
                <strong>{startDateDisplay}</strong>. Total{' '}
                <strong>{totalMonths} months</strong> of fee collection completed. 
                Current fee cycle is <strong>{currentDateDisplay}</strong>.
              </span>
            </p>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">💰</span> Currency & Number Format Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Symbol
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.currencySymbol || '৳'}
                onChange={(e) => handleFinancialChange('currencySymbol', e.target.value)}
                placeholder="e.g., ৳, $, ₹"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.currencyCode || 'BDT'}
                onChange={(e) => handleFinancialChange('currencyCode', e.target.value)}
                placeholder="e.g., BDT, USD, INR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Places
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.decimalPlaces || 2}
                onChange={(e) => handleFinancialChange('decimalPlaces', parseInt(e.target.value))}
              >
                <option value="0">0 (No decimals)</option>
                <option value="1">1 (e.g., 1,234.5)</option>
                <option value="2">2 (e.g., 1,234.56)</option>
                <option value="3">3 (e.g., 1,234.567)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Position
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.currencyPosition || 'after'}
                onChange={(e) => handleFinancialChange('currencyPosition', e.target.value as 'before' | 'after')}
              >
                <option value="after">After (1,000 ৳)</option>
                <option value="before">Before (৳ 1,000)</option>
              </select>
            </div>
          </div>

          {/* Date & Separator Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.dateFormat || 'DD/MM/YYYY'}
                onChange={(e) => handleFinancialChange('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (01/04/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (04/01/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-04-01)</option>
                <option value="DD-MMM-YYYY">DD-MMM-YYYY (01-Apr-2026)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thousand Separator
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.thousandSeparator || ','}
                onChange={(e) => handleFinancialChange('thousandSeparator', e.target.value)}
              >
                <option value=",">, (comma)</option>
                <option value=" "> (space)</option>
                <option value="">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Separator
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={settings.financial?.decimalSeparator || '.'}
                onChange={(e) => handleFinancialChange('decimalSeparator', e.target.value)}
              >
                <option value=">">. (dot)</option>
                <option value=",">, (comma)</option>
              </select>
            </div>
          </div>

          {/* Format Preview */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">💡 Format Previews:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-500">Amount Format:</span>
                <div className="text-lg font-mono font-medium text-indigo-600 mt-1">
                  1{settings.financial?.thousandSeparator || ','}234{settings.financial?.thousandSeparator || ','
                  }567{settings.financial?.decimalSeparator || '.'}{String(settings.financial?.decimalPlaces || 2).padEnd(settings.financial?.decimalPlaces || 2, '0')} {settings.financial?.currencySymbol || '৳'}
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-500">Date Format:</span>
                <div className="text-lg font-mono font-medium text-green-600 mt-1">
                  {settings.financial?.dateFormat === 'DD/MM/YYYY' && '01/04/2026'}
                  {settings.financial?.dateFormat === 'MM/DD/YYYY' && '04/01/2026'}
                  {settings.financial?.dateFormat === 'YYYY-MM-DD' && '2026-04-01'}
                  {settings.financial?.dateFormat === 'DD-MMM-YYYY' && '01-Apr-2026'}
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-500">Full Example:</span>
                <div className="text-lg font-mono font-medium text-orange-600 mt-1">
                  {settings.financial?.dateFormat === 'DD/MM/YYYY' && '01/04/2026'}
                  {settings.financial?.dateFormat === 'MM/DD/YYYY' && '04/01/2026'}
                  {settings.financial?.dateFormat === 'YYYY-MM-DD' && '2026-04-01'}
                  {settings.financial?.dateFormat === 'DD-MMM-YYYY' && '01-Apr-2026'} - 1{settings.financial?.thousandSeparator || ','}000 {settings.financial?.currencySymbol || '৳'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="mb-8 hidden">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">💰</span> Currency Settings (Hidden - Use above settings)
          </h3>
        </div>

        {/* Notification Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">🔔</span> Notification Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable Email Notifications</label>
                <p className="text-xs text-gray-500">Send email alerts for financial transactions</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.financial?.enableNotifications || false}
                onChange={(e) => handleFinancialChange('enableNotifications', e.target.checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable SMS Notifications</label>
                <p className="text-xs text-gray-500">Send SMS alerts for financial transactions</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.financial?.enableSmsNotifications || false}
                onChange={(e) => handleFinancialChange('enableSmsNotifications', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📋 Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Organization Start:</span>
                <span className="font-medium">{startDateDisplay}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Total Months Running:</span>
                <span className="font-medium text-blue-600">{totalMonths} months</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Current Date:</span>
                <span className="font-medium text-green-600">{currentDateDisplay}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{settings.financial?.currencySymbol || '৳'} ({settings.financial?.currencyCode || 'BDT'})</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Email Notifications:</span>
                <span className="font-medium">{settings.financial?.enableNotifications ? '✅ Enabled' : '❌ Disabled'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">SMS Notifications:</span>
                <span className="font-medium">{settings.financial?.enableSmsNotifications ? '✅ Enabled' : '❌ Disabled'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettings;