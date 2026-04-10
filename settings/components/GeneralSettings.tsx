// src/pages/settings/components/GeneralSettings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { OrganizationSettings } from '../../../types/settings';
import { toast } from 'sonner';

interface GeneralSettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, updateSettings }) => {
  const { currentOrganization } = useAuth();
  const [logoPreview, setLogoPreview] = useState<string>(settings.general?.logo || '');
  const [uploading, setUploading] = useState(false);

  // Local state for form fields
  const [localOrgName, setLocalOrgName] = useState<string>(
    currentOrganization?.name || settings.general?.organizationName || ''
  );
  const [localOrgEmail, setLocalOrgEmail] = useState<string>(
    currentOrganization?.email || settings.general?.organizationEmail || ''
  );
  const [localOrgPhone, setLocalOrgPhone] = useState<string>(
    currentOrganization?.phone || settings.general?.organizationPhone || ''
  );
  const [localOrgAddress, setLocalOrgAddress] = useState<string>(
    currentOrganization?.address || settings.general?.organizationAddress || ''
  );

  // ওয়াটারমার্ক লোকাল স্টেট
  const [watermarkText, setWatermarkText] = useState<string>(
    settings.general?.watermarkText || 'স্মৃতি চিরন্তন'
  );
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(
    settings.general?.watermarkOpacity !== undefined ? settings.general.watermarkOpacity : 0.1
  );
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(
    settings.general?.watermarkEnabled !== false
  );
  const [watermarkRotation, setWatermarkRotation] = useState<number>(
    settings.general?.watermarkRotation !== undefined ? settings.general.watermarkRotation : -12
  );

  useEffect(() => {
    setLocalOrgName(currentOrganization?.name || settings.general?.organizationName || '');
    setLocalOrgEmail(currentOrganization?.email || settings.general?.organizationEmail || '');
    setLocalOrgPhone(currentOrganization?.phone || settings.general?.organizationPhone || '');
    setLocalOrgAddress(currentOrganization?.address || settings.general?.organizationAddress || '');
    setWatermarkText(settings.general?.watermarkText || 'স্মৃতি চিরন্তন');
    setWatermarkOpacity(settings.general?.watermarkOpacity !== undefined ? settings.general.watermarkOpacity : 0.1);
    setWatermarkEnabled(settings.general?.watermarkEnabled !== false);
    setWatermarkRotation(settings.general?.watermarkRotation !== undefined ? settings.general.watermarkRotation : -12);
  }, [currentOrganization, settings.general]);

  useEffect(() => {
    if (settings.general?.logo) {
      setLogoPreview(settings.general.logo);
    }
  }, [settings.general?.logo]);

  const handleGeneralChange = (field: keyof typeof settings.general, value: any) => {
    updateSettings({
      general: { ...settings.general, [field]: value }
    });
  };

  const handleOrgNameChange = (value: string) => {
    setLocalOrgName(value);
    handleGeneralChange('organizationName', value);
  };

  const handleOrgEmailChange = (value: string) => {
    setLocalOrgEmail(value);
    handleGeneralChange('organizationEmail', value);
  };

  const handleOrgPhoneChange = (value: string) => {
    setLocalOrgPhone(value);
    handleGeneralChange('organizationPhone', value);
  };

  const handleOrgAddressChange = (value: string) => {
    setLocalOrgAddress(value);
    handleGeneralChange('organizationAddress', value);
  };

  // ওয়াটারমার্ক হ্যান্ডলার
  const handleWatermarkTextChange = (value: string) => {
    setWatermarkText(value);
    handleGeneralChange('watermarkText', value);
  };

  const handleWatermarkOpacityChange = (value: number) => {
    setWatermarkOpacity(value);
    handleGeneralChange('watermarkOpacity', value);
  };

  const handleWatermarkEnabledChange = (value: boolean) => {
    setWatermarkEnabled(value);
    handleGeneralChange('watermarkEnabled', value);
  };

  const handleWatermarkRotationChange = (value: number) => {
    setWatermarkRotation(value);
    handleGeneralChange('watermarkRotation', value);
  };

  // ============================================
  // লোগো কম্প্রেস করার ফাংশন (JPEG তে কনভার্ট + সাইজ কমানো)
  // ============================================
  const compressAndConvertToJPEG = (file: File, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // ক্যানভাস তৈরি করা
          const canvas = document.createElement('canvas');
          
          // ইমেজের ডাইমেনশন কমানো (যদি খুব বড় হয়)
          let width = img.width;
          let height = img.height;
          const maxSize = 300; // ম্যাক্সিমাম 300px (লোগোর জন্য যথেষ্ট)
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // ক্যানভাসে ইমেজ আঁকা
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // JPEG হিসেবে কম্প্রেস করে নেওয়া (quality 0.7 মানে 70% কোয়ালিটি)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (error) => {
          reject(error);
        };
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    // ফাইল সাইজ চেক (5MB পর্যন্ত অনুমোদিত, কম্প্রেশনের আগে)
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo size should be less than 5MB (will be compressed to ~50KB)');
      setUploading(false);
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      setUploading(false);
      return;
    }
    
    try {
      // ইমেজ কম্প্রেস করে JPEG তে কনভার্ট করা
      // quality 0.5 মানে 50% - সাইজ অনেক কমবে, কিন্তু কোয়ালিটি ভালো থাকবে
      const compressedBase64 = await compressAndConvertToJPEG(file, 0.6);
      
      // কম্প্রেসড সাইজ ক্যালকুলেট করা (ডিবাগের জন্য)
      const compressedSize = Math.round((compressedBase64.length * 3) / 4);
      const compressedSizeKB = (compressedSize / 1024).toFixed(2);
      const originalSizeKB = (file.size / 1024).toFixed(2);
      
      console.log(`Original: ${originalSizeKB}KB → Compressed: ${compressedSizeKB}KB`);
      
      if (compressedSize > 200 * 1024) { // 200KB এর বেশি হলে আরও কম্প্রেস
        console.log('Still large, compressing more...');
        const moreCompressed = await compressAndConvertToJPEG(file, 0.4);
        const moreCompressedSize = Math.round((moreCompressed.length * 3) / 4);
        console.log(`Further compressed: ${(moreCompressedSize / 1024).toFixed(2)}KB`);
        setLogoPreview(moreCompressed);
        handleGeneralChange('logo', moreCompressed);
      } else {
        setLogoPreview(compressedBase64);
        handleGeneralChange('logo', compressedBase64);
      }
      
      toast.success(`Logo compressed to ~${compressedSizeKB}KB`);
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Failed to process image. Please try another image.');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    handleGeneralChange('logo', '');
  };

  const orgCode = currentOrganization?.code || settings.general?.organizationCode || '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure your organization's basic information and branding
        </p>
      </div>

      <div className="p-6">
        {/* Organization Logo */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-600">🖼️</span> Organization Branding
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-gray-400">🏢</span>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <label className="inline-block cursor-pointer">
                  <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                    {uploading ? 'Compressing...' : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                </label>
                {logoPreview && (
                  <button
                    onClick={removeLogo}
                    className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto-compressed to JPEG (~50-100KB) | Max 300x300px
              </p>
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Slogan
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={settings.general?.slogan || ''}
                    onChange={(e) => handleGeneralChange('slogan', e.target.value)}
                    placeholder="e.g., Together for Better Future"
                  />
                  <p className="text-xs text-gray-500 mt-1">A short tagline for your organization</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={settings.general?.website || ''}
                    onChange={(e) => handleGeneralChange('website', e.target.value)}
                    placeholder="https://your-organization.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* WATERMARK SETTINGS */}
        {/* ============================================ */}
        <div className="mb-8 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-purple-200">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">💧</span> Watermark Settings
          </h3>
          
          <div className="space-y-4">
            {/* Enable/Disable Watermark */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-800">Enable Watermark</p>
                <p className="text-xs text-gray-500">Show watermark on receipts and documents</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={watermarkEnabled}
                  onChange={(e) => handleWatermarkEnabledChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Watermark Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watermark Text
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={watermarkText}
                onChange={(e) => handleWatermarkTextChange(e.target.value)}
                placeholder="e.g., স্মৃতি চিরন্তন, Official Document, Confidential"
                disabled={!watermarkEnabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                This text will appear as watermark on receipts
              </p>
            </div>

            {/* Watermark Opacity Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watermark Opacity: {(watermarkOpacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.01"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                value={watermarkOpacity}
                onChange={(e) => handleWatermarkOpacityChange(parseFloat(e.target.value))}
                disabled={!watermarkEnabled}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Light (5%)</span>
                <span>Medium (15%)</span>
                <span>Dark (30%)</span>
              </div>
            </div>

            {/* Watermark Rotation Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watermark Rotation: {watermarkRotation}°
              </label>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                value={watermarkRotation}
                onChange={(e) => handleWatermarkRotationChange(parseInt(e.target.value))}
                disabled={!watermarkEnabled}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-45° (বাঁ দিকে)</span>
                <span>0° (সোজা)</span>
                <span>45° (ডান দিকে)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                নেতিবাচক মান বাঁ দিকে ঘোরাবে, ধনাত্মক মান ডান দিকে ঘোরাবে
              </p>
            </div>

            {/* Live Preview */}
            {watermarkEnabled && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200 relative overflow-hidden">
                <p className="text-sm font-medium text-gray-700 mb-2">Live Preview:</p>
                <div className="relative bg-gray-100 rounded-lg h-40 flex items-center justify-center overflow-hidden">
                  <p className="text-gray-500 z-10 relative">Receipt Content Here</p>
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ opacity: watermarkOpacity }}
                  >
                    <div 
                      className="text-center"
                      style={{ transform: `rotate(${watermarkRotation}deg)` }}
                    >
                      {logoPreview && (
                        <img 
                          src={logoPreview} 
                          alt="Watermark" 
                          className="w-16 h-16 mx-auto mb-1 opacity-50"
                          style={{ filter: 'grayscale(100%)' }}
                        />
                      )}
                      <div className="text-lg font-bold text-gray-700 whitespace-nowrap">
                        {watermarkText}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {localOrgName}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This is how your watermark will look on receipts (Rotation: {watermarkRotation}°)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BASIC INFORMATION */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">📋</span> Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={localOrgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                placeholder="e.g., Al-Amin Somity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                value={orgCode}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={settings.general?.registrationNumber || ''}
                onChange={(e) => handleGeneralChange('registrationNumber', e.target.value)}
                placeholder="e.g., S-12345/2021"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Established Year
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={settings.general?.establishedYear || ''}
                onChange={(e) => handleGeneralChange('establishedYear', e.target.value ? parseInt(e.target.value) : '')}
                placeholder="e.g., 2021"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID / BIN
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={settings.general?.taxId || ''}
                onChange={(e) => handleGeneralChange('taxId', e.target.value)}
                placeholder="e.g., 123456789012"
              />
            </div>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-600">📞</span> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={localOrgEmail}
                onChange={(e) => handleOrgEmailChange(e.target.value)}
                placeholder="info@organization.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={localOrgPhone}
                onChange={(e) => handleOrgPhoneChange(e.target.value)}
                placeholder="+8801XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternative Phone
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={settings.general?.alternativePhone || ''}
                onChange={(e) => handleGeneralChange('alternativePhone', e.target.value)}
                placeholder="+8801XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fax Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={settings.general?.fax || ''}
                onChange={(e) => handleGeneralChange('fax', e.target.value)}
                placeholder="e.g., +8802-XXXXXXX"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={localOrgAddress}
                onChange={(e) => handleOrgAddressChange(e.target.value)}
                placeholder="Full address of the organization"
              />
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>🏢</span> Organization Preview
          </h3>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
            ) : (
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <span className="text-xl">🏢</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-900">{localOrgName || 'Organization Name'}</p>
              <p className="text-sm text-gray-600">{settings.general?.slogan || 'Your organization slogan'}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <p className="text-xs text-gray-500">{localOrgEmail || 'email@example.com'}</p>
                <p className="text-xs text-gray-500">{localOrgPhone || 'phone'}</p>
                <p className="text-xs text-gray-500">Code: {orgCode || 'N/A'}</p>
              </div>
            </div>
          </div>
          {watermarkEnabled && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-xs text-gray-500">
                💧 Watermark: "{watermarkText}" ({(watermarkOpacity * 100).toFixed(0)}% opacity, {watermarkRotation}° rotation)
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 <strong>Note:</strong> Changes made here will be saved to your organization's settings. 
            The watermark will appear on all receipts and documents. Click the "Save Changes" button 
            at the top of the settings page to apply your updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;