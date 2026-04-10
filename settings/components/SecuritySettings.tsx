// src/pages/settings/components/SecuritySettings.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import type { OrganizationSettings } from '../../../types/settings';

interface SecuritySettingsProps {
  settings: OrganizationSettings;
  updateSettings: (updates: Partial<OrganizationSettings>) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ settings, updateSettings }) => {
  const handleSecurityChange = (field: keyof typeof settings.security, value: any) => {
    updateSettings({
      security: { ...settings.security, [field]: value }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure security and authentication preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Extra security layer for user accounts
              </p>
            </div>
            <Switch
              checked={settings.security.require2FA}
              onCheckedChange={(checked) => handleSecurityChange('require2FA', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => handleSecurityChange('maxLoginAttempts', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordExpiryDays">Password Expiry (Days)</Label>
            <Input
              id="passwordExpiryDays"
              type="number"
              value={settings.security.passwordExpiryDays}
              onChange={(e) => handleSecurityChange('passwordExpiryDays', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;