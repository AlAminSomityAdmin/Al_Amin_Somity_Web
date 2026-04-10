// src/pages/settings/system.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';
import { 
  Loader2, Save, AlertTriangle, FileText, Archive, Download, Shield, Settings, Users, DollarSign, 
  TrendingUp, Database, Zap, Power, Eye
} from 'lucide-react';

interface SystemSettings {
  dataExport: {
    autoExport: boolean;
    exportFrequency: 'daily' | 'weekly' | 'monthly';
    exportDataTypes: string[];
    lastExport: Date | null;
  };
  dataRetention: {
    logsRetention: number;
    deletedMembersRetention: number;
    autoCleanup: boolean;
  };
  performance: {
    itemsPerPage: number;
    enableLazyLoading: boolean;
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  auditLog: {
    enabled: boolean;
    trackLogin: boolean;
    trackSettingsChange: boolean;
  };
  updatedAt: Date;
  updatedBy: string;
}

const defaultSettings: SystemSettings = {
  dataExport: {
    autoExport: false,
    exportFrequency: 'weekly',
    exportDataTypes: ['members', 'fees', 'loans'],
    lastExport: null
  },
  dataRetention: {
    logsRetention: 90,
    deletedMembersRetention: 365,
    autoCleanup: true
  },
  performance: {
    itemsPerPage: 50,
    enableLazyLoading: true
  },
  maintenance: {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please check back later.'
  },
  auditLog: {
    enabled: true,
    trackLogin: true,
    trackSettingsChange: true
  },
  updatedAt: new Date(),
  updatedBy: ''
};

const SystemSettings: React.FC = () => {
  const { user, currentOrganization } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('export');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [currentOrganization]);

  const loadSettings = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const orgRef = doc(db, 'organizations', currentOrganization.id);
      const snapshot = await getDoc(orgRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.settings?.system) {
          setSettings({ ...defaultSettings, ...data.settings.system });
        }
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
      toast.error('সিস্টেম সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!currentOrganization?.id) return;
    
    setSaving(true);
    try {
      const orgRef = doc(db, 'organizations', currentOrganization.id);
      await updateDoc(orgRef, {
        'settings.system': {
          dataExport: settings.dataExport,
          dataRetention: settings.dataRetention,
          performance: settings.performance,
          maintenance: settings.maintenance,
          auditLog: settings.auditLog,
          updatedAt: new Date(),
          updatedBy: user?.uid
        }
      });
      toast.success('✅ সিস্টেম সেটিংস সেভ হয়েছে!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleManualExport = async () => {
    if (!currentOrganization) return;
    
    if (settings.dataExport.exportDataTypes.length === 0) {
      toast.error('কমপক্ষে একটি ডাটা টাইপ সিলেক্ট করুন');
      return;
    }
    
    setExporting(true);
    toast.info('ডাটা এক্সপোর্ট শুরু হচ্ছে...');
    
    try {
      const dataToExport: Record<string, any[]> = {};
      let totalRecords = 0;
      
      // Members data
      if (settings.dataExport.exportDataTypes.includes('members')) {
        const membersSnap = await getDocs(collection(db, 'organizations', currentOrganization.id, 'members'));
        dataToExport.members = membersSnap.docs.map(doc => ({
          memberId: doc.data().memberId,
          fullName: doc.data().fullName,
          phone: doc.data().phone,
          email: doc.data().email,
          joinDate: doc.data().membership?.dateOfJoin,
          status: doc.data().membership?.status,
          shares: doc.data().membership?.shareCount
        }));
        totalRecords += dataToExport.members.length;
      }
      
      // Fees data
      if (settings.dataExport.exportDataTypes.includes('fees')) {
        const feesSnap = await getDocs(collection(db, 'organizations', currentOrganization.id, 'fees'));
        dataToExport.fees = feesSnap.docs.map(doc => ({
          receiptId: doc.data().receiptId,
          memberName: doc.data().memberName,
          amount: doc.data().feeAmount,
          paymentDate: doc.data().paymentDate?.toDate?.() || doc.data().paymentDate,
          type: doc.data().feeType
        }));
        totalRecords += dataToExport.fees.length;
      }
      
      // Loans data
      if (settings.dataExport.exportDataTypes.includes('loans')) {
        const loansSnap = await getDocs(collection(db, 'organizations', currentOrganization.id, 'loans'));
        dataToExport.loans = loansSnap.docs.map(doc => ({
          loanId: doc.data().loanId,
          memberName: doc.data().memberName,
          amount: doc.data().loanAmount,
          interest: doc.data().interestRate,
          status: doc.data().status,
          duration: doc.data().duration
        }));
        totalRecords += dataToExport.loans.length;
      }
      
      // Create CSV content
      let csvContent = `"Export from ${currentOrganization.name}"\n`;
      csvContent += `"Date: ${new Date().toLocaleString()}"\n`;
      csvContent += `"Total Records: ${totalRecords}"\n\n`;
      
      for (const [type, data] of Object.entries(dataToExport)) {
        if (data.length === 0) continue;
        
        csvContent += `\n"=== ${type.toUpperCase()} DATA ===\n`;
        const headers = Object.keys(data[0]);
        csvContent += headers.join(',') + '\n';
        
        for (const item of data) {
          const row = headers.map(h => {
            const val = item[h];
            if (val === undefined || val === null) return '""';
            if (val instanceof Date) return `"${val.toLocaleDateString()}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(',');
          csvContent += row + '\n';
        }
      }
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentOrganization.name}_backup_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      updateSettings({
        dataExport: {
          ...settings.dataExport,
          lastExport: new Date()
        }
      });
      
      toast.success(`✅ ${totalRecords} রেকর্ড এক্সপোর্ট হয়েছে!`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('এক্সপোর্ট করতে সমস্যা হয়েছে');
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: 'export', label: '📥 ডাটা এক্সপোর্ট', icon: <Download className="h-4 w-4" /> },
    { id: 'retention', label: '🗑️ ডাটা রিটেনশন', icon: <Archive className="h-4 w-4" /> },
    { id: 'performance', label: '⚡ পারফরম্যান্স', icon: <Zap className="h-4 w-4" /> },
    { id: 'maintenance', label: '🔧 মেইনটেন্যান্স', icon: <Settings className="h-4 w-4" /> },
    { id: 'audit', label: '👁️ অডিট লগ', icon: <Eye className="h-4 w-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ সিস্টেম সেটিংস</h1>
          <p className="text-gray-500 mt-1">
            ডাটা ব্যাকআপ, পারফরম্যান্স এবং সিস্টেম কনফিগারেশন
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          সেভ করুন
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ==================== DATA EXPORT TAB ==================== */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-800">📌 ডাটা এক্সপোর্ট কী?</h4>
                    <p className="text-xs text-green-700 mt-1">
                      • আপনার সব ডাটা CSV ফাইল হিসেবে ডাউনলোড করুন<br />
                      • এক্সেলে খুলে বিশ্লেষণ করতে পারবেন<br />
                      • ব্যাকআপ হিসেবে রাখতে পারবেন<br />
                      • ফায়ারবেস নিজে থেকে ডেইলি ব্যাকআপ নেয় (সুপার অ্যাডমিন)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-600">শেষ এক্সপোর্ট:</p>
                    <p className="font-medium">
                      {settings.dataExport.lastExport 
                        ? new Date(settings.dataExport.lastExport).toLocaleString()
                        : 'কখনো হয়নি'}
                    </p>
                  </div>
                  <button
                    onClick={handleManualExport}
                    disabled={exporting}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {exporting ? 'এক্সপোর্ট হচ্ছে...' : 'এখনই এক্সপোর্ট করুন'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">কোন ডাটা এক্সপোর্ট করবেন?</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'members', label: '👥 সদস্য', icon: <Users className="h-4 w-4" /> },
                    { id: 'fees', label: '💰 ফি', icon: <DollarSign className="h-4 w-4" /> },
                    { id: 'loans', label: '💸 লোন', icon: <TrendingUp className="h-4 w-4" /> }
                  ].map(type => (
                    <label key={type.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={settings.dataExport.exportDataTypes.includes(type.id)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...settings.dataExport.exportDataTypes, type.id]
                            : settings.dataExport.exportDataTypes.filter(t => t !== type.id);
                          updateSettings({ dataExport: { ...settings.dataExport, exportDataTypes: newTypes } });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm flex items-center gap-1">
                        {type.icon}
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== DATA RETENTION TAB ==================== */}
          {activeTab === 'retention' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800">⚠️ ডাটা রিটেনশন কী?</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      • নির্দিষ্ট সময়ের পর পুরনো ডাটা ডিলিট হয়ে যাবে<br />
                      • ডিলিট হওয়া ডাটা আর ফিরানো যাবে না<br />
                      • ডাটাবেজ ছোট রাখতে সাহায্য করে
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    লগ রিটেনশন (দিন)
                  </label>
                  <input
                    type="number"
                    value={settings.dataRetention.logsRetention}
                    onChange={(e) => updateSettings({ dataRetention: { ...settings.dataRetention, logsRetention: parseInt(e.target.value) } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">সিস্টেম লগ কতদিন রাখবেন</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="h-4 w-4 inline mr-1" />
                    ডিলিটেড সদস্য রিটেনশন (দিন)
                  </label>
                  <input
                    type="number"
                    value={settings.dataRetention.deletedMembersRetention}
                    onChange={(e) => updateSettings({ dataRetention: { ...settings.dataRetention, deletedMembersRetention: parseInt(e.target.value) } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">ডিলিট সদস্যের ডাটা কতদিন রাখবেন</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">অটো ক্লিনআপ</p>
                    <p className="text-xs text-gray-500">পুরনো ডাটা অটোমেটিক ডিলিট হবে</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ dataRetention: { ...settings.dataRetention, autoCleanup: !settings.dataRetention.autoCleanup } })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      settings.dataRetention.autoCleanup ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.dataRetention.autoCleanup ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PERFORMANCE TAB ==================== */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">⚡ পারফরম্যান্স সেটিংস</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      • বেশি আইটেম দেখালে লোডিং স্লো হতে পারে<br />
                      • লেজি লোডিং চালু থাকলে স্ক্রোল করলে লোড হবে
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="h-4 w-4 inline mr-1" />
                    প্রতি পেজে আইটেম সংখ্যা
                  </label>
                  <select
                    value={settings.performance.itemsPerPage}
                    onChange={(e) => updateSettings({ performance: { ...settings.performance, itemsPerPage: parseInt(e.target.value) } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="20">২০ টি</option>
                    <option value="50">৫০ টি</option>
                    <option value="100">১০০ টি</option>
                    <option value="200">২০০ টি</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">লেজি লোডিং</p>
                    <p className="text-xs text-gray-500">স্ক্রোল করলে ডাটা লোড হবে</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ performance: { ...settings.performance, enableLazyLoading: !settings.performance.enableLazyLoading } })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      settings.performance.enableLazyLoading ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.performance.enableLazyLoading ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== MAINTENANCE TAB ==================== */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Power className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-800">🔧 মেইনটেন্যান্স মোড</h4>
                    <p className="text-xs text-orange-700 mt-1">
                      • চালু করলে সাধারণ ইউজার লগইন করতে পারবেন না<br />
                      • শুধু অ্যাডমিনরা এক্সেস পাবেন<br />
                      • আপডেট বা সমস্যা সমাধানের সময় ব্যবহার করুন
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${settings.maintenance.maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${settings.maintenance.maintenanceMode ? 'bg-red-100' : 'bg-gray-200'}`}>
                      <Settings className={`h-5 w-5 ${settings.maintenance.maintenanceMode ? 'text-red-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">মেইনটেন্যান্স মোড</h3>
                      <p className="text-sm text-gray-500">
                        {settings.maintenance.maintenanceMode 
                          ? '🔴 সিস্টেম মেইনটেন্যান্স মোডে আছে' 
                          : '🟢 সিস্টেম নরমালি চলছে'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!settings.maintenance.maintenanceMode) {
                        if (confirm('⚠️ মেইনটেন্যান্স মোড চালু করলে সাধারণ ইউজাররা লগইন করতে পারবেন না। আপনি কি নিশ্চিত?')) {
                          updateSettings({ maintenance: { ...settings.maintenance, maintenanceMode: true } });
                          toast.warning('মেইনটেন্যান্স মোড চালু হয়েছে');
                        }
                      } else {
                        updateSettings({ maintenance: { ...settings.maintenance, maintenanceMode: false } });
                        toast.info('মেইনটেন্যান্স মোড বন্ধ হয়েছে');
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      settings.maintenance.maintenanceMode 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {settings.maintenance.maintenanceMode ? 'বন্ধ করুন' : 'চালু করুন'}
                  </button>
                </div>
              </div>

              {settings.maintenance.maintenanceMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মেইনটেন্যান্স মেসেজ</label>
                  <textarea
                    rows={2}
                    value={settings.maintenance.maintenanceMessage}
                    onChange={(e) => updateSettings({ maintenance: { ...settings.maintenance, maintenanceMessage: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">ইউজারদের এই মেসেজ দেখাবে</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== AUDIT LOG TAB ==================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-800">🔒 অডিট লগ কী?</h4>
                    <p className="text-xs text-purple-700 mt-1">
                      • কে কখন লগইন করেছে ট্র্যাক করে<br />
                      • কে সেটিংস পরিবর্তন করেছে দেখায়<br />
                      • নিরাপত্তার জন্য গুরুত্বপূর্ণ
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">অডিট লগ সক্রিয় করুন</h3>
                  <p className="text-sm text-gray-500">সব কার্যকলাপ ট্র্যাক করতে</p>
                </div>
                <button
                  onClick={() => updateSettings({ auditLog: { ...settings.auditLog, enabled: !settings.auditLog.enabled } })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.auditLog.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.auditLog.enabled ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {settings.auditLog.enabled && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">কি ট্র্যাক করবেন:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-sm">🔐 লগইন অ্যাক্টিভিটি</span>
                      <input
                        type="checkbox"
                        checked={settings.auditLog.trackLogin}
                        onChange={(e) => updateSettings({ auditLog: { ...settings.auditLog, trackLogin: e.target.checked } })}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-sm">⚙️ সেটিংস পরিবর্তন</span>
                      <input
                        type="checkbox"
                        checked={settings.auditLog.trackSettingsChange}
                        onChange={(e) => updateSettings({ auditLog: { ...settings.auditLog, trackSettingsChange: e.target.checked } })}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800">ℹ️ জানুন</h4>
            <p className="text-xs text-blue-700 mt-1">
              • <strong>ডাটা এক্সপোর্ট</strong> → আপনার কম্পিউটারে CSV ফাইল সেভ হয়<br />
              • <strong>ডাটা রিটেনশন</strong> → পুরনো ডাটা অটো ডিলিট করে<br />
              • <strong>পারফরম্যান্স</strong> → অ্যাপের স্পিড কন্ট্রোল করে<br />
              • <strong>মেইনটেন্যান্স</strong> → আপডেটের সময় অ্যাপ বন্ধ রাখে<br />
              • <strong>অডিট লগ</strong> → নিরাপত্তার জন্য লগ রাখে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;