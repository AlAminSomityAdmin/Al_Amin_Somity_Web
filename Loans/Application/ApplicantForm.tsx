// src/components/Loans/Application/ApplicantForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, MapPin, Briefcase, DollarSign, Users, Mail, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationSettings } from '../../../context/OrganizationSettingsContext';
import { memberService } from '../../../services/memberService';
import { toast } from 'sonner';

export interface ApplicantData {
  isMember: boolean;
  memberID?: string;
  name: string;
  phone: string;
  nid?: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number;
  email?: string;
  joinDate?: string;
  shareCount?: number;
}

export interface GrantorData {
  memberID: string;
  name: string;
  phone: string;
  relation: string;
  email?: string;
  shareCount?: number;
}

export interface LoanApplicantFormData {
  applicant: ApplicantData;
  grantor: GrantorData;
}

interface LoanApplicantFormProps {
  onSubmit: (data: LoanApplicantFormData) => void;
  initialData?: Partial<LoanApplicantFormData>;
}

interface SimpleMember {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  email?: string;
  shareCount: number;
  monthlyFee: number;
  status: string;
  dateOfJoin?: string;
}

const RELATION_OPTIONS = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

const LoanApplicantForm: React.FC<LoanApplicantFormProps> = ({ onSubmit, initialData }) => {
  const { currentOrganization } = useAuth();
  const { settings } = useOrganizationSettings();
  const [activeTab, setActiveTab] = useState<'member' | 'nonMember'>('member');
  const [formData, setFormData] = useState<LoanApplicantFormData>({
    applicant: {
      isMember: true,
      memberID: '',
      name: '',
      phone: '',
      nid: '',
      address: '',
      occupation: '',
      monthlyIncome: 0,
      email: '',
      joinDate: '',
      shareCount: 0,
    },
    grantor: {
      memberID: '',
      name: '',
      phone: '',
      relation: '',
      email: '',
      shareCount: 0,
    },
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [memberSearch, setMemberSearch] = useState('');
  const [grantorSearch, setGrantorSearch] = useState('');
  const [members, setMembers] = useState<SimpleMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<SimpleMember[]>([]);
  const [filteredGrantors, setFilteredGrantors] = useState<SimpleMember[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showGrantorDropdown, setShowGrantorDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const memberSearchRef = useRef<HTMLDivElement>(null);
  const grantorSearchRef = useRef<HTMLDivElement>(null);

  const memberSettings = settings?.member;
  const memberIdPrefix = memberSettings?.memberIdPrefix || 'MBR-';
  const shareSettings = settings?.share;
  const perShareValue = shareSettings?.perShareValue || 1000;

  useEffect(() => {
    if (currentOrganization?.id) {
      loadMembers();
    }
  }, [currentOrganization]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(false);
      }
      if (grantorSearchRef.current && !grantorSearchRef.current.contains(event.target as Node)) {
        setShowGrantorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMembers = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const membersData = await memberService.getSimpleMembers(currentOrganization.id);
      setMembers(membersData);
      setFilteredMembers(membersData);
      setFilteredGrantors(membersData);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberSearch.trim()) {
      const filtered = members.filter(m =>
        m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.memberId.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.phone.includes(memberSearch)
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [memberSearch, members]);

  useEffect(() => {
    if (grantorSearch.trim()) {
      const filtered = members.filter(m =>
        m.memberId !== formData.applicant.memberID &&
        (m.fullName.toLowerCase().includes(grantorSearch.toLowerCase()) ||
         m.memberId.toLowerCase().includes(grantorSearch.toLowerCase()) ||
         m.phone.includes(grantorSearch))
      );
      setFilteredGrantors(filtered);
    } else {
      setFilteredGrantors(members.filter(m => m.memberId !== formData.applicant.memberID));
    }
  }, [grantorSearch, members, formData.applicant.memberID]);

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (activeTab === 'member' && !formData.applicant.memberID) {
      errors.applicantMember = 'Please select a member';
    }

    if (activeTab === 'nonMember') {
      if (!formData.applicant.name.trim()) errors.applicantName = 'Name is required';
      if (!formData.applicant.phone.trim()) errors.applicantPhone = 'Phone number is required';
      else if (!/^01[3-9]\d{8}$/.test(formData.applicant.phone)) {
        errors.applicantPhone = 'Enter a valid phone number';
      }
    }

    if (!formData.grantor.memberID) errors.grantorMember = 'Please select a guarantor';
    if (!formData.grantor.relation) errors.grantorRelation = 'Please select relation';

    if (formData.applicant.memberID && formData.grantor.memberID && 
        formData.applicant.memberID === formData.grantor.memberID) {
      errors.grantorMember = 'Applicant and guarantor cannot be the same person';
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  const handleApplicantMemberSelect = (member: SimpleMember) => {
    setFormData(prev => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        isMember: true,
        memberID: member.memberId,
        name: member.fullName,
        phone: member.phone,
        email: member.email || '',
        shareCount: member.shareCount,
        joinDate: member.dateOfJoin || '',
      }
    }));
    setMemberSearch(member.fullName);
    setShowMemberDropdown(false);
    if (errors.applicantMember) setErrors(prev => ({ ...prev, applicantMember: '' }));
  };

  const handleGrantorSelect = (member: SimpleMember) => {
    setFormData(prev => ({
      ...prev,
      grantor: {
        ...prev.grantor,
        memberID: member.memberId,
        name: member.fullName,
        phone: member.phone,
        email: member.email || '',
        shareCount: member.shareCount,
      }
    }));
    setGrantorSearch(member.fullName);
    setShowGrantorDropdown(false);
    if (errors.grantorMember) setErrors(prev => ({ ...prev, grantorMember: '' }));
  };

  const handleApplicantChange = (field: keyof ApplicantData, value: any) => {
    setFormData(prev => ({
      ...prev,
      applicant: { ...prev.applicant, [field]: value }
    }));
    const errorKey = `applicant${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: '' }));
  };

  const handleGrantorChange = (field: keyof GrantorData, value: any) => {
    setFormData(prev => ({
      ...prev,
      grantor: { ...prev.grantor, [field]: value }
    }));
    const errorKey = `grantor${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: '' }));
  };

  const handleTabChange = (tab: 'member' | 'nonMember') => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        isMember: tab === 'member',
        memberID: tab === 'member' ? prev.applicant.memberID : '',
        name: tab === 'member' ? '' : prev.applicant.name,
        phone: tab === 'member' ? '' : prev.applicant.phone,
      }
    }));
    setErrors({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Applicant Information</h2>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700">Loading members...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Applicant Type Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              type="button"
              onClick={() => handleTabChange('member')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'member'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Member
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('nonMember')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'nonMember'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Non-Member
            </button>
          </nav>
        </div>

        {/* Applicant Section */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Applicant Details</h3>
          
          {activeTab === 'member' ? (
            <div className="space-y-4">
              <div ref={memberSearchRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Member *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberDropdown(true);
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    placeholder={`Search by Member ID (${memberIdPrefix}...), Name or Phone`}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.applicantMember ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.applicantMember && (
                  <p className="text-red-500 text-xs mt-1">{errors.applicantMember}</p>
                )}
                
                {showMemberDropdown && filteredMembers.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.memberId}
                        onClick={() => handleApplicantMemberSelect(member)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                      >
                        <div className="font-semibold text-gray-900">{member.fullName}</div>
                        <div className="text-sm text-gray-500">
                          {member.memberId} • {member.phone}
                        </div>
                        {member.email && (
                          <div className="text-xs text-gray-400 mt-1">{member.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.applicant.memberID && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formData.applicant.name}</p>
                        <p className="text-sm text-gray-600">{formData.applicant.memberID}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          applicant: { ...prev.applicant, memberID: '', name: '', phone: '', email: '', shareCount: 0, joinDate: '' }
                        }));
                        setMemberSearch('');
                      }}
                      className="text-red-500 text-xs hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                    >
                      Change
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-blue-200">
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{formData.applicant.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shares</p>
                      <p className="text-sm font-medium">{formData.applicant.shareCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Share Value</p>
                      <p className="text-sm font-medium">৳{((formData.applicant.shareCount || 0) * perShareValue).toLocaleString()}</p>
                    </div>
                    {formData.applicant.email && (
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium truncate">{formData.applicant.email}</p>
                      </div>
                    )}
                    {formData.applicant.joinDate && (
                      <div>
                        <p className="text-xs text-gray-500">Join Date</p>
                        <p className="text-sm font-medium">{formData.applicant.joinDate}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Monthly Fee</p>
                      <p className="text-sm font-medium">৳{((formData.applicant.shareCount || 0) * perShareValue).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.applicant.name}
                  onChange={(e) => handleApplicantChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.applicantName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.applicantName && <p className="text-red-500 text-xs mt-1">{errors.applicantName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.applicant.phone}
                    onChange={(e) => handleApplicantChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.applicantPhone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.applicantPhone && <p className="text-red-500 text-xs mt-1">{errors.applicantPhone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NID Number</label>
                <input
                  type="text"
                  value={formData.applicant.nid}
                  onChange={(e) => handleApplicantChange('nid', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={formData.applicant.email}
                    onChange={(e) => handleApplicantChange('email', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.applicant.occupation}
                    onChange={(e) => handleApplicantChange('occupation', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (৳)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={formData.applicant.monthlyIncome || ''}
                    onChange={(e) => handleApplicantChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={formData.applicant.address}
                    onChange={(e) => handleApplicantChange('address', e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grantor Section */}
        <div className="border-t pt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Guarantor Information *</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div ref={grantorSearchRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Guarantor Member *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={grantorSearch}
                  onChange={(e) => {
                    setGrantorSearch(e.target.value);
                    setShowGrantorDropdown(true);
                  }}
                  onFocus={() => setShowGrantorDropdown(true)}
                  placeholder={`Search by Member ID (${memberIdPrefix}...), Name or Phone`}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.grantorMember ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.grantorMember && <p className="text-red-500 text-xs mt-1">{errors.grantorMember}</p>}
              
              {showGrantorDropdown && filteredGrantors.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                  {filteredGrantors.map((member) => (
                    <div
                      key={member.memberId}
                      onClick={() => handleGrantorSelect(member)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{member.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {member.memberId} • {member.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relation *</label>
              <select
                value={formData.grantor.relation}
                onChange={(e) => handleGrantorChange('relation', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.grantorRelation ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Relation</option>
                {RELATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.grantorRelation && <p className="text-red-500 text-xs mt-1">{errors.grantorRelation}</p>}
            </div>
          </div>

          {formData.grantor.memberID && (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formData.grantor.name}</p>
                    <p className="text-sm text-gray-600">{formData.grantor.memberID}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      grantor: { memberID: '', name: '', phone: '', relation: '', email: '', shareCount: 0 }
                    }));
                    setGrantorSearch('');
                  }}
                  className="text-red-500 text-xs hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                >
                  Change
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-green-200">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{formData.grantor.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Relation</p>
                  <p className="text-sm font-medium capitalize">{formData.grantor.relation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Shares</p>
                  <p className="text-sm font-medium">{formData.grantor.shareCount || 0}</p>
                </div>
                {formData.grantor.email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium truncate">{formData.grantor.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-red-800 mb-1">Please fix the following errors:</h4>
            <ul className="text-xs text-red-700 list-disc list-inside">
              {Object.values(errors).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplicantForm;