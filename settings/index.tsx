// src/pages/settings/index.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { OrganizationSettings } from '../../types/settings';
import { DEFAULT_ORGANIZATION_SETTINGS } from '../../types/settings';
import { toast } from 'sonner';
import { Loader2, Save, AlertTriangle, X } from 'lucide-react';
import { useSettingsValidation } from '../../hooks/useSettingsValidation';

// Your components
import GeneralSettings from './components/GeneralSettings';
import ShareSettings from './components/ShareSettings';
import FeeSettings from './components/FeeSettings';
import MemberSettings from './components/MemberSettings';
import LoanSettings from './components/LoanSettings';
import IslamicLoanSettings from './components/IslamicLoanSettings';
import InvestmentSettings from './components/InvestmentSettings';
import CollectionSettings from './components/CollectionSettings';
import FinancialSettings from './components/FinancialSettings';
import ReportSettings from './components/ReportSettings';
import SecuritySettings from './components/SecuritySettings';

const OrganizationSettingsPage: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_ORGANIZATION_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<OrganizationSettings>(DEFAULT_ORGANIZATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { 
    validateSettingsChange, 
    warnings, 
    showWarningModal, 
    setShowWarningModal, 
    pendingChanges, 
    setPendingChanges 
  } = useSettingsValidation();

  useEffect(() => {
    fetchSettings();
  }, [currentOrganization]);

  const fetchSettings = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const orgDoc = await getDoc(doc(db, 'organizations', currentOrganization.id));
      if (orgDoc.exists()) {
        const data = orgDoc.data();
        if (data.settings) {
          const loadedSettings = { ...DEFAULT_ORGANIZATION_SETTINGS, ...data.settings };
          setSettings(loadedSettings);
          setOriginalSettings(loadedSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // 👇 এই ফাংশনটি components এর updateSettings prop এ পাস করতে হবে
  const updateSettings = (updates: Partial<OrganizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const performSave = async (settingsToSave: OrganizationSettings) => {
    if (!currentOrganization?.id) return;
    
    try {
      setSaving(true);
      await updateDoc(doc(db, 'organizations', currentOrganization.id), {
        settings: settingsToSave,
        updatedAt: new Date()
      });
      setOriginalSettings(settingsToSave);
      toast.success('✅ Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || '❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization?.id) return;
    
    // Check if there are any actual changes
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    if (!hasChanges) {
      toast.info('ℹ️ No changes to save. Please modify something first.');
      return;
    }
    
    // Validate changes before saving
    const warningsList = await validateSettingsChange(settings, originalSettings);
    
    if (warningsList.length > 0) {
      // Show warning modal
      setPendingChanges(settings);
      setShowWarningModal(true);
      return;
    }
    
    // No warnings, save directly
    await performSave(settings);
  };

  const handleConfirmSave = async () => {
    if (pendingChanges) {
      await performSave(pendingChanges);
    }
    setShowWarningModal(false);
    setPendingChanges(null);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢' },
    { id: 'share', label: 'Share', icon: '📊' },
    { id: 'fee', label: 'Fees', icon: '💰' },
    { id: 'member', label: 'Members', icon: '👥' },
    { id: 'loan', label: 'Loans', icon: '💵' },
    { id: 'islamic', label: 'Islamic Loans', icon: '🕌' },
    { id: 'investment', label: 'Investment', icon: '📈' },
    { id: 'collection', label: 'Collection', icon: '💳' },
    { id: 'financial', label: 'Financial', icon: '📊' },
    { id: 'report', label: 'Reports', icon: '📋' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Configure your organization's settings and preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex flex-wrap gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <GeneralSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'share' && (
          <ShareSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'fee' && (
          <FeeSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'member' && (
          <MemberSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'loan' && (
          <LoanSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'islamic' && (
          <IslamicLoanSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'investment' && (
          <InvestmentSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'collection' && (
          <CollectionSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'financial' && (
          <FinancialSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'report' && (
          <ReportSettings settings={settings} updateSettings={updateSettings} />
        )}
        {activeTab === 'security' && (
          <SecuritySettings settings={settings} updateSettings={updateSettings} />
        )}
      </div>

      // src/pages/settings/index.tsx - Warning Modal অংশ replace করো

{showWarningModal && warnings.length > 0 && (  // 👈 warnings.length > 0 যোগ করো
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">⚠️ Important Warning</h2>
          </div>
          <button
            onClick={() => {
              setShowWarningModal(false);
              setPendingChanges(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Your changes may affect existing data. Please review the following:
        </p>
        
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {warnings.map((warning, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="font-medium text-yellow-800">{warning.message}</p>
              <p className="text-sm text-yellow-700 mt-1">{warning.impact}</p>
              <p className="text-sm text-yellow-600 mt-1 font-medium">💡 {warning.suggestion}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            <strong>⚠️ Note:</strong> These changes cannot be automatically reverted. 
            Make sure you understand the impact before proceeding.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleConfirmSave}
            className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            I Understand, Save Anyway
          </button>
          <button
            onClick={() => {
              setShowWarningModal(false);
              setPendingChanges(null);
            }}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

      )}
    </div>
  );
};

export default OrganizationSettingsPage;