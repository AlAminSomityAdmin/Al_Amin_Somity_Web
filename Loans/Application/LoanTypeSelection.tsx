// src/components/Loans/Application/LoanTypeSelection.tsx
import React from 'react';
import { useOrganizationSettings } from '../../../context/OrganizationSettingsContext';
import { TrendingUp, Users, Sprout, Heart, Building2, DollarSign, Home, Shield } from 'lucide-react';

interface LoanTypeSelectionProps {
  onSelect: (loanType: string) => void;
  selectedType?: string;
}

const LOAN_TYPES = [
  { value: 'murabaha', label: 'Murabaha', description: 'Cost-plus financing for asset purchases', icon: TrendingUp, color: 'blue' },
  { value: 'musharaka', label: 'Musharaka', description: 'Joint partnership profit-sharing', icon: Users, color: 'green' },
  { value: 'mudaraba', label: 'Mudaraba', description: 'Profit-sharing investment partnership', icon: TrendingUp, color: 'teal' },
  { value: 'salam', label: 'Salam', description: 'Advance payment for future delivery', icon: Sprout, color: 'orange' },
  { value: 'ijarah', label: 'Ijarah', description: 'Lease-based financing', icon: Home, color: 'pink' },
  { value: 'istisna', label: 'Istisna', description: 'Custom manufacturing financing', icon: Building2, color: 'purple' },
  { value: 'kafalah', label: 'Kafalah', description: 'Guarantee-based financing', icon: Shield, color: 'yellow' },
  { value: 'qardHasanah', label: 'Qard Hasanah', description: 'Interest-free benevolent loan', icon: Heart, color: 'red' },
  { value: 'tawarruq', label: 'Tawarruq', description: 'Commodity-based liquidity', icon: DollarSign, color: 'indigo' },
];

const LoanTypeSelection: React.FC<LoanTypeSelectionProps> = ({ onSelect, selectedType }) => {
  const { settings } = useOrganizationSettings();
  const islamicLoanConfig = settings?.islamicLoanConfig;
  const enabledLoanTypes = LOAN_TYPES.filter(type => islamicLoanConfig?.[type.value]?.enabled !== false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {enabledLoanTypes.map(type => {
        const Icon = type.icon;
        const isEnabled = islamicLoanConfig?.[type.value]?.enabled !== false;
        if (!isEnabled) return null;
        return (
          <button key={type.value} onClick={() => onSelect(type.value)} className={`p-4 border-2 rounded-xl text-left transition-all ${selectedType === type.value ? `border-${type.color}-500 bg-${type.color}-50 ring-2 ring-${type.color}-200` : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
            <Icon className={`h-8 w-8 text-${type.color}-600 mb-3`} />
            <h3 className="font-semibold text-gray-900">{type.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default LoanTypeSelection;