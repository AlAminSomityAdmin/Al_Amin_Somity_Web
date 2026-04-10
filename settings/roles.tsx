// src/pages/settings/roles.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';
import { 
  Loader2, Plus, Edit, Trash2, Shield, Users, Eye, 
  DollarSign, CreditCard, FileText, Settings, Bell,
  UserPlus, CheckCircle, XCircle, Copy,
  Save, X, Crown,
  TrendingUp
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    // Member Management
    viewMembers: boolean;
    addMember: boolean;
    editMember: boolean;
    deleteMember: boolean;
    approveMember: boolean;
    
    // Fee Management
    viewFees: boolean;
    collectFee: boolean;
    editFee: boolean;
    waiveFee: boolean;
    
    // Loan Management
    viewLoans: boolean;
    applyLoan: boolean;
    approveLoan: boolean;
    disburseLoan: boolean;
    collectLoanPayment: boolean;
    
    // Cashier
    viewTransactions: boolean;
    cashIn: boolean;
    cashOut: boolean;
    transfer: boolean;
    
    // Reports
    viewReports: boolean;
    generateReport: boolean;
    exportData: boolean;
    
    // Settings
    viewSettings: boolean;
    editSettings: boolean;
    manageRoles: boolean;
    
    // Communication
    sendNotification: boolean;
    viewNotices: boolean;
    postNotice: boolean;
    
    // Investment
    viewInvestments: boolean;
    createInvestment: boolean;
    manageInvestments: boolean;
  };
  isDefault: boolean;
  memberCount: number;
  createdAt: Date;
}

const defaultPermissions = {
  viewMembers: false,
  addMember: false,
  editMember: false,
  deleteMember: false,
  approveMember: false,
  viewFees: false,
  collectFee: false,
  editFee: false,
  waiveFee: false,
  viewLoans: false,
  applyLoan: false,
  approveLoan: false,
  disburseLoan: false,
  collectLoanPayment: false,
  viewTransactions: false,
  cashIn: false,
  cashOut: false,
  transfer: false,
  viewReports: false,
  generateReport: false,
  exportData: false,
  viewSettings: false,
  editSettings: false,
  manageRoles: false,
  sendNotification: false,
  viewNotices: false,
  postNotice: false,
  viewInvestments: false,
  createInvestment: false,
  manageInvestments: false,
};

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: Object.fromEntries(Object.keys(defaultPermissions).map(k => [k, true])) as any,
    isDefault: true,
    memberCount: 0,
    createdAt: new Date()
  },
  {
    id: 'cashier',
    name: 'Cashier',
    description: 'Can collect fees and manage transactions',
    permissions: {
      ...defaultPermissions,
      viewMembers: true,
      viewFees: true,
      collectFee: true,
      viewLoans: true,
      collectLoanPayment: true,
      viewTransactions: true,
      cashIn: true,
      cashOut: true,
      transfer: true,
      viewReports: true,
      viewNotices: true,
    },
    isDefault: true,
    memberCount: 0,
    createdAt: new Date()
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Basic member access',
    permissions: {
      ...defaultPermissions,
      viewMembers: false,
      viewFees: true,
      viewLoans: true,
      applyLoan: true,
      viewTransactions: true,
      viewReports: true,
      viewNotices: true,
      viewInvestments: true,
    },
    isDefault: true,
    memberCount: 0,
    createdAt: new Date()
  }
];

const Roles: React.FC = () => {
  const { user, currentOrganization } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: { ...defaultPermissions }
  });

  useEffect(() => {
    loadRoles();
  }, [currentOrganization]);

  const loadRoles = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const rolesRef = collection(db, 'organizations', currentOrganization.id, 'roles');
      const snapshot = await getDocs(rolesRef);
      
      const loadedRoles: Role[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        loadedRoles.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          permissions: data.permissions,
          isDefault: data.isDefault || false,
          memberCount: data.memberCount || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        });
      });
      
      if (loadedRoles.length === 0) {
        // Create default roles
        for (const role of defaultRoles) {
          const roleRef = doc(rolesRef, role.id);
          await setDoc(roleRef, {
            ...role,
            createdAt: new Date(),
            createdBy: user?.uid
          });
          loadedRoles.push(role);
        }
      }
      
      setRoles(loadedRoles.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async () => {
    if (!currentOrganization?.id) return;
    
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    
    setSaving(true);
    try {
      const rolesRef = collection(db, 'organizations', currentOrganization.id, 'roles');
      const roleId = editingRole?.id || formData.name.toLowerCase().replace(/\s+/g, '_');
      
      const roleData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
        isDefault: editingRole?.isDefault || false,
        updatedAt: new Date(),
        updatedBy: user?.uid
      };
      
      if (editingRole) {
        const roleRef = doc(rolesRef, editingRole.id);
        await updateDoc(roleRef, roleData);
        toast.success('Role updated successfully!');
      } else {
        const roleRef = doc(rolesRef, roleId);
        await setDoc(roleRef, {
          ...roleData,
          id: roleId,
          createdAt: new Date(),
          createdBy: user?.uid,
          memberCount: 0
        });
        toast.success('Role created successfully!');
      }
      
      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: { ...defaultPermissions } });
      await loadRoles();
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error(error.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isDefault) {
      toast.error('Cannot delete default role');
      return;
    }
    
    if (role.memberCount > 0) {
      toast.error(`Cannot delete role with ${role.memberCount} members assigned`);
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${role.name}" role?`)) return;
    
    try {
      if (!currentOrganization?.id) return;
      const roleRef = doc(db, 'organizations', currentOrganization.id, 'roles', role.id);
      await deleteDoc(roleRef);
      toast.success('Role deleted successfully!');
      await loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions }
    });
    setShowModal(true);
  };

  const togglePermission = (key: keyof typeof defaultPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const permissionGroups = [
    {
      name: 'Member Management',
      icon: <Users className="h-4 w-4" />,
      permissions: [
        { key: 'viewMembers', label: 'View Members', icon: <Eye className="h-3 w-3" /> },
        { key: 'addMember', label: 'Add Member', icon: <UserPlus className="h-3 w-3" /> },
        { key: 'editMember', label: 'Edit Member', icon: <Edit className="h-3 w-3" /> },
        { key: 'deleteMember', label: 'Delete Member', icon: <Trash2 className="h-3 w-3" /> },
        { key: 'approveMember', label: 'Approve Member', icon: <CheckCircle className="h-3 w-3" /> }
      ]
    },
    {
      name: 'Fee Management',
      icon: <DollarSign className="h-4 w-4" />,
      permissions: [
        { key: 'viewFees', label: 'View Fees', icon: <Eye className="h-3 w-3" /> },
        { key: 'collectFee', label: 'Collect Fee', icon: <CreditCard className="h-3 w-3" /> },
        { key: 'editFee', label: 'Edit Fee', icon: <Edit className="h-3 w-3" /> },
        { key: 'waiveFee', label: 'Waive Fee', icon: <XCircle className="h-3 w-3" /> }
      ]
    },
    {
      name: 'Loan Management',
      icon: <CreditCard className="h-4 w-4" />,
      permissions: [
        { key: 'viewLoans', label: 'View Loans', icon: <Eye className="h-3 w-3" /> },
        { key: 'applyLoan', label: 'Apply Loan', icon: <FileText className="h-3 w-3" /> },
        { key: 'approveLoan', label: 'Approve Loan', icon: <CheckCircle className="h-3 w-3" /> },
        { key: 'disburseLoan', label: 'Disburse Loan', icon: <DollarSign className="h-3 w-3" /> },
        { key: 'collectLoanPayment', label: 'Collect Loan Payment', icon: <CreditCard className="h-3 w-3" /> }
      ]
    },
    {
      name: 'Cashier',
      icon: <CreditCard className="h-4 w-4" />,
      permissions: [
        { key: 'viewTransactions', label: 'View Transactions', icon: <Eye className="h-3 w-3" /> },
        { key: 'cashIn', label: 'Cash In', icon: <DollarSign className="h-3 w-3" /> },
        { key: 'cashOut', label: 'Cash Out', icon: <DollarSign className="h-3 w-3" /> },
        { key: 'transfer', label: 'Transfer', icon: <Copy className="h-3 w-3" /> }
      ]
    },
    {
      name: 'Reports',
      icon: <FileText className="h-4 w-4" />,
      permissions: [
        { key: 'viewReports', label: 'View Reports', icon: <Eye className="h-3 w-3" /> },
        { key: 'generateReport', label: 'Generate Reports', icon: <FileText className="h-3 w-3" /> },
        { key: 'exportData', label: 'Export Data', icon: <Save className="h-3 w-3" /> }
      ]
    },
    {
      name: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      permissions: [
        { key: 'viewSettings', label: 'View Settings', icon: <Eye className="h-3 w-3" /> },
        { key: 'editSettings', label: 'Edit Settings', icon: <Edit className="h-3 w-3" /> },
        { key: 'manageRoles', label: 'Manage Roles', icon: <Shield className="h-3 w-3" /> }
      ]
    },
    {
      name: 'Communication',
      icon: <Bell className="h-4 w-4" />,
      permissions: [
        { key: 'sendNotification', label: 'Send Notification', icon: <Bell className="h-3 w-3" /> },
        { key: 'viewNotices', label: 'View Notices', icon: <Eye className="h-3 w-3" /> },
        { key: 'postNotice', label: 'Post Notice', icon: <FileText className="h-3 w-3" /> }
      ]
    },
    {
      name: 'Investment',
      icon: <TrendingUp className="h-4 w-4" />,
      permissions: [
        { key: 'viewInvestments', label: 'View Investments', icon: <Eye className="h-3 w-3" /> },
        { key: 'createInvestment', label: 'Create Investment', icon: <Plus className="h-3 w-3" /> },
        { key: 'manageInvestments', label: 'Manage Investments', icon: <Settings className="h-3 w-3" /> }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Manage user roles and access permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: { ...defaultPermissions } });
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    role.name === 'Administrator' ? 'bg-red-100' :
                    role.name === 'Cashier' ? 'bg-green-100' :
                    role.name === 'Member' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {role.name === 'Administrator' ? <Crown className="h-5 w-5 text-red-600" /> :
                     role.name === 'Cashier' ? <CreditCard className="h-5 w-5 text-green-600" /> :
                     role.name === 'Member' ? <Users className="h-5 w-5 text-blue-600" /> :
                     <Shield className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                  </div>
                </div>
                {role.isDefault && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Default</span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {role.memberCount} members
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {Object.values(role.permissions).filter(p => p).length} permissions
                </span>
              </div>
              
              {!role.isDefault && (
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Basic Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Field Officer, Accountant"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this role can do"
                />
              </div>
              
              {/* Permissions */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Permissions</h3>
                <div className="space-y-6">
                  {permissionGroups.map(group => (
                    <div key={group.name}>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        {group.icon}
                        <h4 className="font-medium text-gray-800">{group.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {group.permissions.map(perm => (
                          <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions[perm.key as keyof typeof defaultPermissions]}
                              onChange={() => togglePermission(perm.key as keyof typeof defaultPermissions)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700 flex items-center gap-1">
                              {perm.icon}
                              {perm.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;