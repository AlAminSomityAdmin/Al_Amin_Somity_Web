// src/context/OrganizationSettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_ORGANIZATION_SETTINGS } from '../types/settings';
import { formatDate } from '../utils/dateUtils';
import { formatAmount, type AmountFormatOptions } from '../utils/amountUtils';

interface OrganizationSettingsContextType {
  settings: any;
  permissions: any;
  loading: boolean;
  refresh: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  getSetting: (path: string, defaultValue?: any) => any;
  // Date & Amount helpers
  getDateFormat: () => string;
  getCurrencySymbol: () => string;
  getCurrencyCode: () => string;
  getCurrencyPosition: () => 'before' | 'after';
  getDecimalPlaces: () => number;
  getThousandSeparator: () => string;
  getDecimalSeparator: () => string;
  // Formatting functions
  formatDate: (date: any) => string;
  formatAmount: (amount: any) => string;
}

const OrganizationSettingsContext = createContext<OrganizationSettingsContextType | null>(null);

export const useOrganizationSettings = () => {
  const context = useContext(OrganizationSettingsContext);
  if (!context) {
    throw new Error('useOrganizationSettings must be used within OrganizationSettingsProvider');
  }
  return context;
};

interface OrganizationSettingsProviderProps {
  children: ReactNode;
}

export const OrganizationSettingsProvider: React.FC<OrganizationSettingsProviderProps> = ({ children }) => {
  const { currentOrganization, userData, currentMember } = useAuth();
  const [settings, setSettings] = useState<any>(DEFAULT_ORGANIZATION_SETTINGS);
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Listen to real-time settings changes
  useEffect(() => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    // Subscribe to organization settings
    const orgRef = doc(db, 'organizations', currentOrganization.id);
    const unsubscribeOrg = onSnapshot(orgRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.settings) {
          setSettings({ ...DEFAULT_ORGANIZATION_SETTINGS, ...data.settings });
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to settings:', error);
      setLoading(false);
    });

    // Subscribe to user permissions
    const userRole = userData?.organizations?.[currentOrganization.id]?.role || 
                     currentMember?.membership?.role || 
                     'member';
    
    const roleRef = doc(db, 'organizations', currentOrganization.id, 'roles', userRole);
    const unsubscribeRole = onSnapshot(roleRef, (doc) => {
      if (doc.exists()) {
        setPermissions(doc.data().permissions || {});
      } else {
        // If role not found, use default member permissions
        setPermissions({
          viewMembers: false,
          viewFees: true,
          viewLoans: true,
          applyLoan: true,
          viewReports: true,
          viewNotices: true,
        });
      }
    }, (error) => {
      console.error('Error listening to permissions:', error);
    });

    return () => {
      unsubscribeOrg();
      unsubscribeRole();
    };
  }, [currentOrganization?.id, userData, currentMember]);

  const refresh = async () => {
    // This is handled by onSnapshot automatically
    // Just trigger a re-fetch if needed
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const hasPermission = (permission: string): boolean => {
    return permissions[permission] === true;
  };

  const getSetting = (path: string, defaultValue: any = null): any => {
    const keys = path.split('.');
    let value = settings;
    for (const key of keys) {
      if (value === undefined || value === null) return defaultValue;
      value = value[key];
    }
    return value !== undefined ? value : defaultValue;
  };

  // Date & Amount formatting helpers
  const getDateFormat = () => {
    return settings?.financial?.dateFormat || 'DD/MM/YYYY';
  };

  const getCurrencySymbol = () => {
    return settings?.financial?.currencySymbol || '৳';
  };

  const getCurrencyCode = () => {
    return settings?.financial?.currencyCode || 'BDT';
  };

  const getCurrencyPosition = () => {
    return settings?.financial?.currencyPosition || 'after';
  };

  const getDecimalPlaces = () => {
    return settings?.financial?.decimalPlaces || 2;
  };

  const getThousandSeparator = () => {
    return settings?.financial?.thousandSeparator || ',';
  };

  const getDecimalSeparator = () => {
    return settings?.financial?.decimalSeparator || '.';
  };

  // Formatting functions using the settings
  const formatDateHelper = (date: any) => {
    return formatDate(date, getDateFormat());
  };

  const formatAmountHelper = (amount: any) => {
    const options: AmountFormatOptions = {
      currencySymbol: getCurrencySymbol(),
      decimalPlaces: getDecimalPlaces(),
      thousandSeparator: getThousandSeparator(),
      position: getCurrencyPosition()
    };
    return formatAmount(amount, options);
  };

  return (
    <OrganizationSettingsContext.Provider value={{
      settings,
      permissions,
      loading,
      refresh,
      hasPermission,
      getSetting,
      getDateFormat,
      getCurrencySymbol,
      getCurrencyCode,
      getCurrencyPosition,
      getDecimalPlaces,
      getThousandSeparator,
      getDecimalSeparator,
      formatDate: formatDateHelper,
      formatAmount: formatAmountHelper
    }}>
      {children}
    </OrganizationSettingsContext.Provider>
  );
};