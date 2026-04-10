// src/pages/Loans/components/LoanTypeSelector.tsx
import React from 'react';
import { 
  ShoppingCart, 
  Handshake, 
  Wheat, 
  Heart, 
  Factory, 
  TrendingUp, 
  Scale, 
  Home, 
  Shield 
} from 'lucide-react';
import type { LoanType } from '../../../types/loan';

export interface LoanTypeOption {
  id: LoanType;
  name: string;
  nameEn: string;
  icon: React.ReactElement;
  description: string;
  color: string;
  features: string[];
  suitableFor: string;
  islamicPrinciple: string;
}

interface LoanTypeSelectorProps {
  onSelect: (loanType: LoanType) => void;
  selectedType?: LoanType;
}

const LOAN_TYPES: LoanTypeOption[] = [
  {
    id: 'murabaha',
    name: 'মুরাবাহা',
    nameEn: 'Murabaha',
    icon: <ShoppingCart className="w-6 h-6" />,
    description: 'পণ্য ক্রয়-বিক্রয় ভিত্তিক লোন',
    color: 'blue',
    features: [
      'পণ্যের নির্দিষ্ট মূল্যে লাভ যোগ',
      'নির্ধারিত সময়ে পরিশোধ',
      'পণ্য হস্তান্তরের আগে চুক্তি',
      'লাভের হার আগে থেকে নির্ধারিত'
    ],
    suitableFor: 'যানবাহন, ইলেকট্রনিক্স, ব্যবসায়িক পণ্য ক্রয়',
    islamicPrinciple: 'বাই-মুআজ্জাল (স্থগিত পেমেন্ট বিক্রয়)'
  },
  {
    id: 'musharaka',
    name: 'মুশারাকা',
    nameEn: 'Musharaka',
    icon: <Handshake className="w-6 h-6" />,
    description: 'যৌথ অংশিদারিত্ব ভিত্তিক লোন',
    color: 'green',
    features: [
      'ব্যাংক ও ক্লায়েন্ট যৌথ বিনিয়োগ',
      'লাভ-লোকসান উভয়েই ভাগ',
      'সময়ের সাথে অংশিদারিত্ব কমতে থাকে',
      'প্রকল্প ব্যবস্থাপনায় অংশগ্রহণ'
    ],
    suitableFor: 'বড় ব্যবসায়িক প্রকল্প, রিয়েল এস্টেট',
    islamicPrinciple: 'মুশারাকাতুল আকদ (চুক্তিভিত্তিক অংশিদারিত্ব)'
  },
  {
    id: 'salam',
    name: 'সালাম',
    nameEn: 'Salam',
    icon: <Wheat className="w-6 h-6" />,
    description: 'অগ্রিম পেমেন্ট ভিত্তিক কৃষি লোন',
    color: 'orange',
    features: [
      'পণ্য ডেলিভারির আগে পেমেন্ট',
      'কৃষি ও খনিজ পণ্যের জন্য',
      'নির্দিষ্ট মান ও পরিমাণ চুক্তি',
      'নির্ধারিত তারিখে ডেলিভারি'
    ],
    suitableFor: 'কৃষি পণ্য, খনিজ, মৎস্য উৎপাদন',
    islamicPrinciple: 'বাই-সালাম (অগ্রিম পেমেন্ট বিক্রয়)'
  },
  {
    id: 'qardHasanah',
    name: 'কারদ হাসানা',
    nameEn: 'Qard Hasanah',
    icon: <Heart className="w-6 h-6" />,
    description: 'বিনা সুদে হাসানা লোন',
    color: 'red',
    features: [
      'সম্পূর্ণ সুদমুক্ত লোন',
      'শুধুমাত্র সেবা চার্জ প্রযোজ্য',
      'সামাজিক দায়বদ্ধতা',
      'জরুরী প্রয়োজনে সহায়তা'
    ],
    suitableFor: 'জরুরী চিকিৎসা, শিক্ষা, বিবাহ ব্যয়',
    islamicPrinciple: 'কারদ-ই-হাসানা (বিনা সুদে ঋণ)'
  },
  {
    id: 'istisna',
    name: 'ইস্তিসনা',
    nameEn: 'Istisna',
    icon: <Factory className="w-6 h-6" />,
    description: 'ম্যানুফ্যাকচারিং/কনস্ট্রাকশন লোন',
    color: 'purple',
    features: [
      'নির্দিষ্ট স্পেসিফিকেশনে পণ্য উৎপাদন',
      'মাইলফলক ভিত্তিক পেমেন্ট',
      'নির্ধারিত সময়ে সমাপ্তি',
      'গুণগত মান নিশ্চিতকরণ'
    ],
    suitableFor: 'বাড়ি নির্মাণ, শিল্প প্রতিষ্ঠান, যন্ত্রপাতি',
    islamicPrinciple: 'ইস্তিসনা (অর্ডার ভিত্তিক উৎপাদন)'
  },
  {
    id: 'mudaraba',
    name: 'মুদারাবা',
    nameEn: 'Mudaraba',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'মুদ্রা বিনিয়োগ ভিত্তিক লোন',
    color: 'teal',
    features: [
      'ব্যাংক মূলধন দেয়, ক্লায়েন্ট শ্রম',
      'লাভ পূর্বনির্ধারিত অনুপাতে',
      'ক্ষতি শুধুমাত্র মূলধন দাতার',
      'ব্যবস্থাপনা ক্লায়েন্টের দায়িত্ব'
    ],
    suitableFor: 'ব্যবসায়িক বিনিয়োগ, ট্রেডিং',
    islamicPrinciple: 'মুদারাবা (মূলধন ও শ্রমের অংশিদারিত্ব)'
  },
  {
    id: 'tawarruq',
    name: 'তাওয়ারুক',
    nameEn: 'Tawarruq',
    icon: <Scale className="w-6 h-6" />,
    description: 'পণ্য মাধ্যমে তরলতা লোন',
    color: 'indigo',
    features: [
      'পণ্য ক্রয়-বিক্রয়ের মাধ্যমে নগদ',
      'ব্যাংক পণ্য ক্রয় করে বিক্রি',
      'ক্লায়েন্ট নগদ অর্থ পায়',
      'নির্ধারিত সময়ে পরিশোধ'
    ],
    suitableFor: 'নগদ তরলতার প্রয়োজন, ঋণ পরিশোধ',
    islamicPrinciple: 'তাওয়ারুক (পণ্য মাধ্যমে নগদ প্রাপ্তি)'
  },
  {
    id: 'ijarah',
    name: 'ইজারা',
    nameEn: 'Ijarah',
    icon: <Home className="w-6 h-6" />,
    description: 'লিজ ভিত্তিক লোন',
    color: 'pink',
    features: [
      'সম্পদ লিজ নেওয়া-দেওয়া',
      'নির্দিষ্ট সময়ের জন্য চুক্তি',
      'মাসিক/বাৎসরিক ভাড়া',
      'সম্পদের মালিকানা ব্যাংকের'
    ],
    suitableFor: 'যানবাহন, মেশিনারি, প্রোপার্টি লিজ',
    islamicPrinciple: 'ইজারা (লিজ বা ভাড়া চুক্তি)'
  },
  {
    id: 'kafalah',
    name: 'কাফালা',
    nameEn: 'Kafalah',
    icon: <Shield className="w-6 h-6" />,
    description: 'গ্যারান্টি ভিত্তিক লোন',
    color: 'yellow',
    features: [
      'তৃতীয় পক্ষের জন্য গ্যারান্টি',
      'আর্থিক বা পারফরমেন্স গ্যারান্টি',
      'নির্দিষ্ট শর্ত সাপেক্ষে',
      'গ্যারান্টি ফি প্রযোজ্য'
    ],
    suitableFor: 'টেন্ডার, পারফরমেন্স বন্ড, অগ্রিম পেমেন্ট',
    islamicPrinciple: 'কাফালা (গ্যারান্টি বা জামানত)'
  }
];

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    hover: 'hover:bg-blue-100 hover:border-blue-300',
    selected: 'bg-blue-100 border-blue-500 ring-2 ring-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    hover: 'hover:bg-green-100 hover:border-green-300',
    selected: 'bg-green-100 border-green-500 ring-2 ring-green-200'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    hover: 'hover:bg-orange-100 hover:border-orange-300',
    selected: 'bg-orange-100 border-orange-500 ring-2 ring-orange-200'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    hover: 'hover:bg-red-100 hover:border-red-300',
    selected: 'bg-red-100 border-red-500 ring-2 ring-red-200'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    hover: 'hover:bg-purple-100 hover:border-purple-300',
    selected: 'bg-purple-100 border-purple-500 ring-2 ring-purple-200'
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    hover: 'hover:bg-teal-100 hover:border-teal-300',
    selected: 'bg-teal-100 border-teal-500 ring-2 ring-teal-200'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    hover: 'hover:bg-indigo-100 hover:border-indigo-300',
    selected: 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-200'
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-800',
    hover: 'hover:bg-pink-100 hover:border-pink-300',
    selected: 'bg-pink-100 border-pink-500 ring-2 ring-pink-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    hover: 'hover:bg-yellow-100 hover:border-yellow-300',
    selected: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-200'
  }
};

const LoanTypeSelector: React.FC<LoanTypeSelectorProps> = ({ onSelect, selectedType }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ঋণের ধরন নির্বাচন করুন</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ইসলামিক ব্যাংকিং নীতিমালা অনুসারে আপনার প্রয়োজন অনুযায়ী উপযুক্ত ঋণের ধরন নির্বাচন করুন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LOAN_TYPES.map((loanType) => {
          const colorClass = COLOR_CLASSES[loanType.color as keyof typeof COLOR_CLASSES];
          const isSelected = selectedType === loanType.id;
          
          return (
            <div
              key={loanType.id}
              onClick={() => onSelect(loanType.id)}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${colorClass.bg} ${colorClass.border} ${colorClass.hover}
                ${isSelected ? colorClass.selected : ''}
                transform hover:scale-105 hover:shadow-lg
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${colorClass.bg} ${colorClass.text}`}>
                    {loanType.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{loanType.name}</h3>
                    <p className="text-xs text-gray-500">{loanType.nameEn}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {loanType.description}
              </p>

              {/* Islamic Principle */}
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">ইসলামিক নীতি:</span>
                <p className="text-xs text-gray-700 mt-1">{loanType.islamicPrinciple}</p>
              </div>

              {/* Suitable For */}
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">উপযুক্ত:</span>
                <p className="text-xs text-gray-700 mt-1">{loanType.suitableFor}</p>
              </div>

              {/* Features */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500">মূল বৈশিষ্ট্য:</span>
                <ul className="text-xs text-gray-700 space-y-1">
                  {loanType.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-1">•</span>
                      {feature}
                    </li>
                  ))}
                  {loanType.features.length > 2 && (
                    <li className="text-blue-600 font-medium">
                      + আরও {loanType.features.length - 2} বৈশিষ্ট্য
                    </li>
                  )}
                </ul>
              </div>

              {/* Select Button */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  className={`
                    w-full py-2 px-3 rounded-md text-sm font-medium transition-colors
                    ${isSelected 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {isSelected ? 'নির্বাচিত' : 'নির্বাচন করুন'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedType && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                নির্বাচিত ঋণের ধরন: {
                  LOAN_TYPES.find(type => type.id === selectedType)?.name
                }
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {
                  LOAN_TYPES.find(type => type.id === selectedType)?.description
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelect(selectedType)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              পরবর্তী ধাপ
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          প্রতিটি ঋণের ধরন ইসলামিক শরীয়াহ নীতিমালা অনুসারে পরিচালিত হয়
        </p>
      </div>
    </div>
  );
};

export default LoanTypeSelector;