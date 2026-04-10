// src/pages/settings/notifications.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';
import { Loader2, Bell, Mail, Phone, Globe, Calendar, AlertCircle, 
  CheckCircle, CreditCard, Users, FileText, TrendingUp, BellOff, Save } from 'lucide-react';

interface NotificationSettings {
  emailAlerts: boolean;
  emailSummary: boolean;
  emailSummaryFrequency: 'daily' | 'weekly' | 'monthly';
  smsAlerts: boolean;
  smsPhoneNumber: string;
  inAppAlerts: boolean;
  notifications: {
    feePayment: boolean;
    feeReminder: boolean;
    loanApproval: boolean;
    loanPayment: boolean;
    newMember: boolean;
    memberUpdate: boolean;
    reportGenerated: boolean;
    systemUpdate: boolean;
    investmentUpdate: boolean;
    meetingReminder: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  digestEnabled: boolean;
  digestDay: number;
}

const defaultSettings: NotificationSettings = {
  emailAlerts: true,
  emailSummary: true,
  emailSummaryFrequency: 'weekly',
  smsAlerts: false,
  smsPhoneNumber: '',
  inAppAlerts: true,
  notifications: {
    feePayment: true,
    feeReminder: true,
    loanApproval: true,
    loanPayment: true,
    newMember: false,
    memberUpdate: false,
    reportGenerated: true,
    systemUpdate: true,
    investmentUpdate: true,
    meetingReminder: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  digestEnabled: true,
  digestDay: 1
};

const Notifications: React.FC = () => {
  const { user, userData } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('channels');

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'notifications');
      const snapshot = await getDoc(settingsRef);
      
      if (snapshot.exists()) {
        const loadedSettings = { ...defaultSettings, ...snapshot.data() };
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } else {
        // Document doesn't exist, create it with default settings
        await setDoc(settingsRef, {
          ...defaultSettings,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }
    
    // Check if there are any changes
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    if (!hasChanges) {
      toast.info('কোনো পরিবর্তন করা হয়নি। প্রথমে কিছু পরিবর্তন করুন।');
      return;
    }
    
    setSaving(true);
    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'notifications');
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      });
      setOriginalSettings(settings);
      toast.success('✅ নোটিফিকেশন সেটিংস সেভ হয়েছে!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateNotificationType = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const tabs = [
    { id: 'channels', label: 'Channels', icon: <Bell className="h-4 w-4" /> },
    { id: 'types', label: 'Notification Types', icon: <AlertCircle className="h-4 w-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="h-4 w-4" /> },
    { id: 'digest', label: 'Digest', icon: <Mail className="h-4 w-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">নোটিফিকেশন সেটিংস</h1>
          <p className="text-gray-500 mt-1">কখন এবং কিভাবে নোটিফিকেশন পাবেন তা নির্ধারণ করুন</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          সেভ করুন
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
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
          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email Notifications */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">ইমেইল</h3>
                    </div>
                    <button
                      onClick={() => updateSettings({ emailAlerts: !settings.emailAlerts })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        settings.emailAlerts ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.emailAlerts ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">ইমেইলে নোটিফিকেশন পান</p>
                  <p className="text-xs text-gray-400 mt-2">{userData?.email}</p>
                </div>

                {/* SMS Notifications */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">এসএমএস</h3>
                    </div>
                    <button
                      onClick={() => updateSettings({ smsAlerts: !settings.smsAlerts })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        settings.smsAlerts ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.smsAlerts ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">এসএমএস অ্যালার্ট পান</p>
                  {settings.smsAlerts && (
                    <input
                      type="tel"
                      placeholder="+8801XXXXXXXXX"
                      value={settings.smsPhoneNumber}
                      onChange={(e) => updateSettings({ smsPhoneNumber: e.target.value })}
                      className="mt-2 w-full px-2 py-1 text-sm border rounded"
                    />
                  )}
                </div>

                {/* In-App Notifications */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-gray-900">অ্যাপে</h3>
                    </div>
                    <button
                      onClick={() => updateSettings({ inAppAlerts: !settings.inAppAlerts })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        settings.inAppAlerts ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.inAppAlerts ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">অ্যাপের ভিতরে নোটিফিকেশন দেখান</p>
                </div>
              </div>

              {/* Email Summary */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">ইমেইল সারাংশ</h3>
                    <p className="text-sm text-gray-500">সব নোটিফিকেশনের সারাংশ পান</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ emailSummary: !settings.emailSummary })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      settings.emailSummary ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.emailSummary ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
                
                {settings.emailSummary && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">সারাংশ ফ্রিকোয়েন্সি</label>
                    <select
                      value={settings.emailSummaryFrequency}
                      onChange={(e) => updateSettings({ emailSummaryFrequency: e.target.value as any })}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="daily">দৈনিক</option>
                      <option value="weekly">সাপ্তাহিক</option>
                      <option value="monthly">মাসিক</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notification Types Tab */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">কোন ইভেন্টের জন্য নোটিফিকেশন পাবেন তা সিলেক্ট করুন</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(settings.notifications).map(([key, value]) => {
                  const icons: Record<string, React.ReactNode> = {
                    feePayment: <CreditCard className="h-4 w-4 text-green-600" />,
                    feeReminder: <Bell className="h-4 w-4 text-yellow-600" />,
                    loanApproval: <CheckCircle className="h-4 w-4 text-blue-600" />,
                    loanPayment: <CreditCard className="h-4 w-4 text-purple-600" />,
                    newMember: <Users className="h-4 w-4 text-indigo-600" />,
                    memberUpdate: <Users className="h-4 w-4 text-gray-600" />,
                    reportGenerated: <FileText className="h-4 w-4 text-orange-600" />,
                    systemUpdate: <Globe className="h-4 w-4 text-gray-600" />,
                    investmentUpdate: <TrendingUp className="h-4 w-4 text-emerald-600" />,
                    meetingReminder: <Calendar className="h-4 w-4 text-red-600" />
                  };
                  
                  const labels: Record<string, string> = {
                    feePayment: 'ফি জমা হয়েছে',
                    feeReminder: 'ফি জমার রিমাইন্ডার',
                    loanApproval: 'লোন অনুমোদিত',
                    loanPayment: 'লোন জমা হয়েছে',
                    newMember: 'নতুন সদস্য যোগদান',
                    memberUpdate: 'সদস্য প্রোফাইল আপডেট',
                    reportGenerated: 'রিপোর্ট জেনারেট',
                    systemUpdate: 'সিস্টেম আপডেট',
                    investmentUpdate: 'ইনভেস্টমেন্ট আপডেট',
                    meetingReminder: 'মিটিং রিমাইন্ডার'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {icons[key]}
                        <span className="text-sm text-gray-700">{labels[key]}</span>
                      </div>
                      <button
                        onClick={() => updateNotificationType(key as any, !value)}
                        className={`relative w-8 h-4 rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                          value ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">কোয়ায়েট আওয়ার</h3>
                  <p className="text-sm text-gray-500">এই সময়ে নোটিফিকেশন পাঠাবেন না</p>
                </div>
                <button
                  onClick={() => updateSettings({ quietHours: { ...settings.quietHours, enabled: !settings.quietHours.enabled } })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.quietHours.enabled ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শুরুর সময়</label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => updateSettings({ quietHours: { ...settings.quietHours, start: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শেষের সময়</label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => updateSettings({ quietHours: { ...settings.quietHours, end: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Digest Tab */}
          {activeTab === 'digest' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">ইমেইল ডাইজেস্ট</h3>
                  <p className="text-sm text-gray-500">সাপ্তাহিক ডাইজেস্ট পান</p>
                </div>
                <button
                  onClick={() => updateSettings({ digestEnabled: !settings.digestEnabled })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.digestEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.digestEnabled ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {settings.digestEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ডাইজেস্টের দিন</label>
                  <select
                    value={settings.digestDay}
                    onChange={(e) => updateSettings({ digestDay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="0">রবিবার</option>
                    <option value="1">সোমবার</option>
                    <option value="2">মঙ্গলবার</option>
                    <option value="3">বুধবার</option>
                    <option value="4">বৃহস্পতিবার</option>
                    <option value="5">শুক্রবার</option>
                    <option value="6">শনিবার</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">প্রতি সপ্তাহে এই দিনে ডাইজেস্ট পাঠানো হবে</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800">নোটিফিকেশন সম্পর্কে</h4>
            <p className="text-xs text-blue-700 mt-1">
              • ইমেইল নোটিফিকেশন আপনার রেজিস্টার্ড ইমেইল ঠিকানায় পাঠানো হবে<br />
              • এসএমএস নোটিফিকেশনের জন্য ক্যারিয়ার চার্জ প্রযোজ্য হতে পারে<br />
              • অ্যাপ নোটিফিকেশন আপনার নোটিফিকেশন সেন্টারে দেখাবে<br />
              • কোয়ায়েট আওয়ার অন্যান্য সব নোটিফিকেশন ওভাররাইড করবে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;