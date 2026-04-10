// src/pages/settings/components/ReportSettings.tsx
import React from 'react';
import type { OrganizationSettings } from '../../../types/settings';

interface ReportSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

// Report type IDs - exact type definition
type ReportTypeId = 'member' | 'fee' | 'loan' | 'financial' | 'cashier' | 'bank' | 'business' | 'investment';

const ReportSettings: React.FC<ReportSettingsProps> = ({ settings, updateSettings }) => {
  const handleReportChange = (field: keyof typeof settings.report, value: any) => {
    updateSettings({
      report: { ...settings.report, [field]: value }
    });
  };

  const reportTypes: { id: ReportTypeId; name: string; icon: string; description: string }[] = [
    { id: 'member', name: 'Member Report', icon: '👥', description: 'Member list, new members, member details' },
    { id: 'fee', name: 'Fee Collection', icon: '💰', description: 'Monthly fee collection, pending fees' },
    { id: 'loan', name: 'Loan Report', icon: '💵', description: 'Loan disbursement, repayment, default' },
    { id: 'financial', name: 'Financial Statement', icon: '📊', description: 'Income, expense, balance sheet' },
    { id: 'cashier', name: 'Cashier Report', icon: '💳', description: 'Daily cash flow, transaction summary' },
    { id: 'bank', name: 'Bank Statement', icon: '🏦', description: 'Bank transactions, account summary' },
    { id: 'business', name: 'Business Report', icon: '🏢', description: 'Business profit, investment returns' },
    { id: 'investment', name: 'Investment Report', icon: '📈', description: 'Project investments, profit distribution' }
  ];

  const formats = [
    { value: 'pdf' as const, name: 'PDF', icon: '📄', description: 'Printable document format' },
    { value: 'excel' as const, name: 'Excel', icon: '📊', description: 'Spreadsheet format for analysis' },
    { value: 'both' as const, name: 'Both', icon: '📁', description: 'Generate both PDF and Excel' }
  ];

  const frequencies = [
    { value: 'daily' as const, name: 'Daily', icon: '📅', description: 'End of each day' },
    { value: 'weekly' as const, name: 'Weekly', icon: '📆', description: 'Every Sunday' },
    { value: 'monthly' as const, name: 'Monthly', icon: '📅', description: 'End of each month' },
    { value: 'quarterly' as const, name: 'Quarterly', icon: '📊', description: 'Every 3 months' },
    { value: 'yearly' as const, name: 'Yearly', icon: '📑', description: 'End of fiscal year' }
  ];

  // Default enabled reports
  const defaultEnabledReports: ReportTypeId[] = ['member', 'fee', 'loan', 'financial', 'cashier', 'bank', 'business', 'investment'];
  const enabledReports = (settings.report.enabledReports as ReportTypeId[]) || defaultEnabledReports;

  const toggleReport = (reportId: ReportTypeId, checked: boolean) => {
    let newEnabled: ReportTypeId[];
    if (checked) {
      newEnabled = [...enabledReports, reportId];
    } else {
      newEnabled = enabledReports.filter(id => id !== reportId);
    }
    handleReportChange('enabledReports', newEnabled);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Report Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure report generation, formats, and auto-schedule preferences
        </p>
      </div>

      <div className="p-6">
        {/* Report Format */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-amber-600">📄</span> Default Report Format
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formats.map((format) => (
              <div
                key={format.value}
                className={`
                  cursor-pointer rounded-lg border-2 p-4 transition-all
                  ${settings.report.defaultReportFormat === format.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-200'
                  }
                `}
                onClick={() => handleReportChange('defaultReportFormat', format.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{format.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{format.name}</p>
                    <p className="text-xs text-gray-500">{format.description}</p>
                  </div>
                </div>
                {settings.report.defaultReportFormat === format.value && (
                  <div className="mt-2 text-xs text-amber-600">✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Auto Generate Reports */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">⚙️</span> Auto-Generate Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable Auto-Generate</label>
                <p className="text-xs text-gray-500">Automatically generate reports on schedule</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.report.autoGenerateReports}
                onChange={(e) => handleReportChange('autoGenerateReports', e.target.checked)}
              />
            </div>

            {settings.report.autoGenerateReports && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation Frequency
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.report.generateFrequency || 'monthly'}
                    onChange={(e) => handleReportChange('generateFrequency', e.target.value as any)}
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.name} - {freq.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.report.generateTime || '23:59'}
                    onChange={(e) => handleReportChange('generateTime', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">When to generate reports (24-hour format)</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Report Types */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">📋</span> Reports to Generate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reportTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{type.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{type.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{type.description}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={enabledReports.includes(type.id)}
                  onChange={(e) => toggleReport(type.id, e.target.checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Retention Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-red-600">🗄️</span> Report Retention
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Retention Period <span className="text-gray-400">(days)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.report.reportRetentionDays}
                onChange={(e) => handleReportChange('reportRetentionDays', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">How long to keep generated reports (0 = forever)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Archive After <span className="text-gray-400">(days)</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={settings.report.autoArchiveAfterDays || 30}
                onChange={(e) => handleReportChange('autoArchiveAfterDays', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">Move old reports to archive</p>
            </div>
          </div>
        </div>

        {/* Email/SMS Report Settings */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-600">📧</span> Report Delivery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Reports</label>
                <p className="text-xs text-gray-500">Send reports via email automatically</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.report.emailReports || false}
                onChange={(e) => handleReportChange('emailReports', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMS Reports</label>
                <p className="text-xs text-gray-500">Send report summaries via SMS</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={settings.report.smsReports || false}
                onChange={(e) => handleReportChange('smsReports', e.target.checked)}
              />
            </div>

            {settings.report.emailReports && (
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Recipients (comma separated)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={settings.report.recipientEmails || ''}
                  onChange={(e) => handleReportChange('recipientEmails', e.target.value)}
                  placeholder="admin@organization.com, cashier@organization.com"
                />
                <p className="text-xs text-gray-500 mt-1">Email addresses to receive reports</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Summary */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📊 Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Default Format:</span>
                <span className="font-medium uppercase">{settings.report.defaultReportFormat}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Auto-Generate:</span>
                <span className="font-medium">{settings.report.autoGenerateReports ? '✅ Enabled' : '❌ Disabled'}</span>
              </p>
              {settings.report.autoGenerateReports && (
                <>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium capitalize">{settings.report.generateFrequency || 'Monthly'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{settings.report.generateTime || '23:59'}</span>
                  </p>
                </>
              )}
            </div>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Retention:</span>
                <span className="font-medium">{settings.report.reportRetentionDays} days</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Enabled Reports:</span>
                <span className="font-medium">{enabledReports.length} / 8</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Email Delivery:</span>
                <span className="font-medium">{settings.report.emailReports ? '✅ On' : '❌ Off'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">SMS Delivery:</span>
                <span className="font-medium">{settings.report.smsReports ? '✅ On' : '❌ Off'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Report Tips:</strong><br />
            • PDF reports are best for printing and sharing<br />
            • Excel reports allow data analysis and custom calculations<br />
            • Auto-generated reports are stored in the Reports section<br />
            • Reports can be manually generated anytime from the Reports menu
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportSettings;