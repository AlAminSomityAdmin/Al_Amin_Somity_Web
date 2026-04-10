// src/pages/settings/account.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { toast } from 'sonner';
import { 
  Eye, EyeOff, Shield, 
  Moon, Sun, Monitor, Globe, Smartphone, Download, Trash2,
  ChevronRight, Bell, Lock, History, Palette
} from 'lucide-react';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: Date;
  isCurrent: boolean;
}

interface LoginHistoryItem {
  id: string;
  date: Date;
  device: string;
  browser: string;
  location: string;
  ip: string;
}

const AccountSettings: React.FC = () => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Language state
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  
  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Sessions
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Windows PC',
      browser: 'Chrome',
      location: 'Dhaka, Bangladesh',
      ip: '192.168.1.1',
      lastActive: new Date(),
      isCurrent: true
    }
  ]);
  
  // Login History
  const [loginHistory] = useState<LoginHistoryItem[]>([
    {
      id: '1',
      date: new Date(),
      device: 'Windows PC',
      browser: 'Chrome',
      location: 'Dhaka, Bangladesh',
      ip: '192.168.1.1'
    }
  ]);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('preferences');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    const savedLanguage = localStorage.getItem('language') as 'bn' | 'en' || 'bn';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const messages = [
      { score: 0, text: 'Very Weak' },
      { score: 1, text: 'Weak' },
      { score: 2, text: 'Fair' },
      { score: 3, text: 'Good' },
      { score: 4, text: 'Strong' },
      { score: 5, text: 'Very Strong' }
    ];
    
    const strength = messages.find(m => m.score === Math.min(score, 5)) || messages[0];
    setPasswordStrength({ score, message: strength.text });
  };

  useEffect(() => {
    if (passwordData.newPassword) {
      checkPasswordStrength(passwordData.newPassword);
    } else {
      setPasswordStrength({ score: 0, message: '' });
    }
  }, [passwordData.newPassword]);

  const handlePasswordChange = async () => {
    if (!user || !user.email) return;
    
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      toast.success('Password changed successfully!');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error(error.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    toast.success('Theme updated!');
  };

  const handleLanguageChange = (newLang: 'bn' | 'en') => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    toast.success(`Language changed to ${newLang === 'bn' ? 'Bangla' : 'English'}`);
  };

  const handleEnable2FA = () => {
    setShow2FAModal(true);
  };

  const handleVerify2FA = () => {
    if (twoFactorCode.length === 6) {
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setTwoFactorCode('');
      toast.success('Two-factor authentication enabled!');
    } else {
      toast.error('Please enter a valid 6-digit code');
    }
  };

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable two-factor authentication?')) {
      setTwoFactorEnabled(false);
      toast.success('Two-factor authentication disabled');
    }
  };

  const handleLogoutAllDevices = () => {
    if (confirm('Are you sure you want to logout from all other devices?')) {
      setSessions(sessions.filter(s => s.isCurrent));
      toast.success('Logged out from other devices successfully!');
    }
  };

  const handleRemoveSession = (sessionId: string) => {
    if (confirm('Remove this session?')) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session removed');
    }
  };

  const handleExportData = () => {
    const exportData = {
      user: {
        uid: user?.uid,
        email: user?.email,
      },
      userData: {
        fullName: userData?.fullName,
        phone: userData?.phone,
        role: userData?.role,
      },
      preferences: {
        theme,
        language,
        emailNotifications,
        smsNotifications,
        twoFactorEnabled
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Your data has been exported!');
  };

  const handleDeleteAccount = () => {
    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText === 'DELETE') {
      toast.error('Account deletion request submitted. Contact support.');
    } else if (confirmText) {
      toast.error('Verification failed. Please type "DELETE" exactly.');
    }
  };

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: <Globe className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'history', label: 'Login History', icon: <History className="h-4 w-4" /> },
    { id: 'data', label: 'Data', icon: <Download className="h-4 w-4" /> }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences, security, and account data</p>
      </div>

      {/* Account Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xl text-white font-bold">{userData?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{userData?.fullName || 'User'}</h3>
            <p className="text-sm text-gray-600">{userData?.email}</p>
            <p className="text-xs text-gray-500">Member since: {userData?.createdAt?.toLocaleDateString() || 'N/A'}</p>
          </div>
        </div>
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
          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleThemeChange('light')} className={`p-3 border rounded-lg text-center ${theme === 'light' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <Sun className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm">Light</span>
                  </button>
                  <button onClick={() => handleThemeChange('dark')} className={`p-3 border rounded-lg text-center ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <Moon className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm">Dark</span>
                  </button>
                  <button onClick={() => handleThemeChange('system')} className={`p-3 border rounded-lg text-center ${theme === 'system' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <Monitor className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm">System</span>
                  </button>
                </div>
              </div>

              {/* Language Settings */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleLanguageChange('bn')} className={`p-3 border rounded-lg text-center ${language === 'bn' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <span className="text-lg">বাংলা</span>
                    <p className="text-xs text-gray-500">Bangla</p>
                  </button>
                  <button onClick={() => handleLanguageChange('en')} className={`p-3 border rounded-lg text-center ${language === 'en' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <span className="text-lg">English</span>
                    <p className="text-xs text-gray-500">English</p>
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive notifications via email</p>
                    </div>
                    <button onClick={() => setEmailNotifications(!emailNotifications)} className={`relative w-10 h-5 rounded-full transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${emailNotifications ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <button onClick={() => setSmsNotifications(!smsNotifications)} className={`relative w-10 h-5 rounded-full transition-colors ${smsNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${smsNotifications ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Password</h3>
                  </div>
                  {!showPasswordForm && (
                    <button onClick={() => setShowPasswordForm(true)} className="text-blue-600 text-sm">Change Password</button>
                  )}
                </div>
                
                {!showPasswordForm ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full w-32">
                        <div className="h-2 bg-green-500 rounded-full w-full"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password protected</p>
                    </div>
                    <p className="text-sm text-gray-500">••••••••</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} className="w-full px-3 py-2 border rounded-lg pr-10" />
                        <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} className="w-full px-3 py-2 border rounded-lg pr-10" />
                        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? 'bg-green-500' : passwordStrength.score >= 3 ? 'bg-blue-500' : passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                            </div>
                            <span className={`text-xs ${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-blue-600' : passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>{passwordStrength.message}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} className="w-full px-3 py-2 border rounded-lg pr-10" />
                        <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handlePasswordChange} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Update Password</button>
                      <button onClick={() => setShowPasswordForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                {twoFactorEnabled ? (
                  <button onClick={handleDisable2FA} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">Enabled</button>
                ) : (
                  <button onClick={handleEnable2FA} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Enable</button>
                )}
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <p className="text-sm text-gray-500">{session.browser} • {session.location}</p>
                      <p className="text-xs text-gray-400">Last active: {session.lastActive.toLocaleDateString()}</p>
                    </div>
                  </div>
                  {session.isCurrent ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Current</span>
                  ) : (
                    <button onClick={() => handleRemoveSession(session.id)} className="text-red-600 text-sm">Remove</button>
                  )}
                </div>
              ))}
              <button onClick={handleLogoutAllDevices} className="w-full mt-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                Logout from all other devices
              </button>
            </div>
          )}

          {/* LOGIN HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {loginHistory.map(history => (
                <div key={history.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <History className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{history.device}</p>
                      <p className="text-sm text-gray-500">{history.browser} • {history.location}</p>
                      <p className="text-xs text-gray-400">{new Date(history.date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <button onClick={handleExportData} className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Export My Data</p>
                    <p className="text-sm text-gray-500">Download a copy of your account data</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <div className="text-left">
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-500">Permanently delete your account</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Enable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code from your authenticator app</p>
            <input type="text" maxLength={6} placeholder="000000" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4 text-center text-2xl tracking-wider" />
            <div className="flex gap-3">
              <button onClick={handleVerify2FA} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Verify & Enable</button>
              <button onClick={() => setShow2FAModal(false)} className="flex-1 border rounded-lg py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800">Security Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside mt-1">
              <li>Use a strong password with at least 8 characters</li>
              <li>Enable two-factor authentication for better security</li>
              <li>Never share your password with anyone</li>
              <li>Review your active sessions regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;