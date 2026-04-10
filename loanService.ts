// src/services/loanService.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  updateDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { parseToDate } from '../utils/dateUtils';
import type { LoanApplication, LoanRepayment, LoanStatus, PaymentType, CollectionStatus } from '../types';
import { generateApplicationId, generateLoanId } from '../utils/loanID';

// ============================================
// TYPES
// ============================================

export interface LoanApplicationData {
  applicant: {
    isMember: boolean;
    memberID?: string;
    name: string;
    phone: string;
    nid?: string;
    address?: string;
    occupation?: string;
    monthlyIncome?: number;
    email?: string;
  };
  grantor: {
    memberID: string;
    name: string;
    phone: string;
    relation: string;
  };
  loanType: string;
  loanDetails: any;
  remarks?: string;
  documents?: any[];
  loanApplicationDate?: Date;
  createdBy: string;
}

export interface LoanApplicationDoc {
  id: string;
  applicationId: string;
  orgId: string;
  status: 'pending' | 'approved' | 'rejected';
  applicant: any;
  grantor: any;
  loanType: string;
  loanDetails: any;
  remarks?: string;
  documents?: any[];
  loanApplicationDate?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LoanDisbursement {
  id: string;
  disbursementId: string;
  loanId: string;
  orgId: string;
  memberId: string;
  memberName: string;
  amount: number;
  disbursementMethod: 'cash' | 'bank' | 'cheque' | 'transfer';
  disbursedFrom: 'cashier_fund' | 'org_bank_account' | 'org_cash';
  sourceDetails: {
    bankName?: string;
    accountNumber?: string;
    chequeNumber?: string;
    transactionId?: string;
  };
  receivedBy: string;
  receivedByName: string;
  receivedByMemberId: string;
  disbursedBy: string;
  disbursedByName: string;
  disbursedAt: Date;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  createdBy: string;
}

// ============================================
// LOAN SERVICE
// ============================================

export const loanService = {
  // ============================================
  // LOAN APPLICATION FUNCTIONS
  // ============================================
  
  async createLoanApplication(
    orgId: string,
    data: LoanApplicationData
  ): Promise<string> {
    try {
      const applicationId = await generateApplicationId();
      const now = Timestamp.now();
      
      const applicationRef = doc(collection(db, 'organizations', orgId, 'loanApplications'));
      
      const applicationData: LoanApplicationDoc = {
        id: applicationRef.id,
        applicationId,
        orgId,
        status: 'pending',
        applicant: data.applicant,
        grantor: data.grantor,
        loanType: data.loanType,
        loanDetails: data.loanDetails,
        remarks: data.remarks || '',
        documents: data.documents || [],
        loanApplicationDate: data.loanApplicationDate || now.toDate(),
        createdBy: data.createdBy,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
      
      await setDoc(applicationRef, applicationData);
      console.log(`✅ Loan application created: ${applicationId}`);
      return applicationId;
    } catch (error) {
      console.error('Error creating loan application:', error);
      throw error;
    }
  },

  async getPendingApplications(orgId: string): Promise<LoanApplicationDoc[]> {
    try {
      const appsRef = collection(db, 'organizations', orgId, 'loanApplications');
      const q = query(appsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplicationDoc));
    } catch (error) {
      console.error('Error getting pending applications:', error);
      return [];
    }
  },

  async getAllApplications(orgId: string): Promise<LoanApplicationDoc[]> {
    try {
      const appsRef = collection(db, 'organizations', orgId, 'loanApplications');
      const q = query(appsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplicationDoc));
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  },

  async getApplicationById(orgId: string, applicationId: string): Promise<LoanApplicationDoc | null> {
    try {
      const appRef = doc(db, 'organizations', orgId, 'loanApplications', applicationId);
      const snapshot = await getDoc(appRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as LoanApplicationDoc;
      }
      return null;
    } catch (error) {
      console.error('Error getting application:', error);
      return null;
    }
  },

  async approveLoanApplication(
    orgId: string,
    applicationId: string,
    approvedBy: string,
    interestRate: number = 10
  ): Promise<string> {
    try {
      const appRef = doc(db, 'organizations', orgId, 'loanApplications', applicationId);
      const appSnap = await getDoc(appRef);
      
      if (!appSnap.exists()) throw new Error('আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      
      const application = appSnap.data() as LoanApplicationDoc;
      
      if (application.status !== 'pending') {
        throw new Error('এই আবেদনটি ইতিমধ্যে প্রক্রিয়াকরণ করা হয়েছে।');
      }
      
      await updateDoc(appRef, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      });
      
      let amount = 0;
      let durationMonths = 12;
      
      switch (application.loanType) {
        case 'murabaha':
          amount = Number(application.loanDetails?.assetCost || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'musharaka':
        case 'mudaraba':
          amount = Number(application.loanDetails?.totalCapital || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'qardHasanah':
          amount = Number(application.loanDetails?.loanAmount || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'salam':
          amount = Number(application.loanDetails?.totalPrice || 0);
          durationMonths = Number(application.loanDetails?.deliveryPeriod || 12);
          break;
        case 'ijarah':
          amount = Number(application.loanDetails?.assetValue || 0);
          durationMonths = Number(application.loanDetails?.leasePeriod || 12);
          break;
        case 'kafalah':
          amount = Number(application.loanDetails?.guaranteeAmount || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'istisna':
          amount = Number(application.loanDetails?.totalCost || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'tawarruq':
          amount = Number(application.loanDetails?.totalCost || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        default:
          amount = Number(application.loanDetails?.amount || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
      }
      
      const totalPayable = amount * (1 + interestRate / 100);
      const monthlyInstallment = Math.round(totalPayable / durationMonths);
      
      const loanId = await generateLoanId(application.loanType as any);
      
      // 🔥 FIX: loanId কে document ID হিসেবে সেট করো
      const loanRef = doc(db, 'organizations', orgId, 'loans', loanId);
      
      const loanData: LoanApplication = {
        id: loanId,
        loanId,
        orgId,
        memberId: application.applicant.memberID || '',
        memberName: application.applicant.name,
        loanType: application.loanType as any,
        amount,
        interestRate,
        durationMonths,
        totalPayable,
        monthlyInstallment,
        purpose: application.loanDetails?.purpose || '',
        status: 'approved',
        guarantorId: application.grantor?.memberID,
        guarantorName: application.grantor?.name,
        approvedBy,
        approvedAt: new Date(),
        paidAmount: 0,
        dueAmount: totalPayable,
        paidInstallments: 0,
        remainingInstallments: durationMonths,
        dueDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000), // approximate
        loanApplicationDate: application.loanApplicationDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: approvedBy,
        remarks: application.remarks
      };
      
      await setDoc(loanRef, loanData);
      
      console.log(`✅ Loan approved: ${loanId}`);
      return loanId;
    } catch (error) {
      console.error('Error approving loan application:', error);
      throw error;
    }
  },

  async rejectLoanApplication(
    orgId: string,
    applicationId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const appRef = doc(db, 'organizations', orgId, 'loanApplications', applicationId);
      await updateDoc(appRef, {
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: reason || '',
        updatedAt: new Date()
      });
      console.log(`✅ Loan application rejected: ${applicationId}`);
    } catch (error) {
      console.error('Error rejecting loan application:', error);
      throw error;
    }
  },

  // ============================================
  // LOAN DISBURSEMENT FUNCTIONS
  // ============================================

  async recordDisbursement(
    orgId: string,
    loanId: string,
    data: {
      amount: number;
      disbursementDate?: Date;
      disbursementMethod: 'cash' | 'bank' | 'cheque' | 'transfer';
      disbursedFrom: 'cashier_fund' | 'org_bank_account' | 'org_cash';
      bankName?: string;
      accountNumber?: string;
      chequeNumber?: string;
      transactionId?: string;
      receivedBy: string;
      receivedByName: string;
      receivedByMemberId: string;
      disbursedBy: string;
      disbursedByName: string;
      notes?: string;
    }
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const disbursementId = `DISB-${Date.now()}`;
      
      // 🔥 FIX: disbursementId কে document ID হিসেবে সেট করো
      const disbursementRef = doc(db, 'organizations', orgId, 'loanDisbursements', disbursementId);
      
      const disbursementAt = data.disbursementDate || now.toDate();
      const disbursementData: LoanDisbursement = {
        id: disbursementId,
        disbursementId,
        loanId,
        orgId,
        memberId: data.receivedBy,
        memberName: data.receivedByName,
        amount: data.amount,
        disbursementMethod: data.disbursementMethod,
        disbursedFrom: data.disbursedFrom,
        sourceDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          chequeNumber: data.chequeNumber,
          transactionId: data.transactionId,
        },
        receivedBy: data.receivedBy,
        receivedByName: data.receivedByName,
        receivedByMemberId: data.receivedByMemberId,
        disbursedBy: data.disbursedBy,
        disbursedByName: data.disbursedByName,
        disbursedAt: disbursementAt,
        notes: data.notes,
        status: 'completed',
        createdAt: now.toDate(),
        createdBy: data.disbursedBy
      };
      
      await setDoc(disbursementRef, disbursementData);
      
      const loanRef = doc(db, 'organizations', orgId, 'loans', loanId);
      await updateDoc(loanRef, {
        status: 'active',
        disbursementId: disbursementId,
        disbursementStatus: 'completed',
        disbursedAt: disbursementAt,
        loanStartDate: disbursementAt,
        disbursedBy: data.disbursedBy,
        disbursedByName: data.disbursedByName,
        disbursementMethod: data.disbursementMethod,
        disbursedFrom: data.disbursedFrom,
        bankName: data.bankName,
        chequeNumber: data.chequeNumber,
        transactionId: data.transactionId,
        updatedAt: now.toDate()
      });
      
      console.log(`✅ Loan disbursement recorded: ${disbursementId}`);
      return disbursementId;
    } catch (error) {
      console.error('Error recording disbursement:', error);
      throw error;
    }
  },

  async getDisbursementByLoanId(orgId: string, loanId: string): Promise<LoanDisbursement | null> {
    try {
      const disbursementsRef = collection(db, 'organizations', orgId, 'loanDisbursements');
      const q = query(disbursementsRef, where('loanId', '==', loanId), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as LoanDisbursement;
      }
      return null;
    } catch (error) {
      console.error('Error getting disbursement:', error);
      return null;
    }
  },

  // ============================================
  // LOAN MANAGEMENT FUNCTIONS
  // ============================================

  async getAllLoans(orgId: string): Promise<LoanApplication[]> {
    try {
      const loansRef = collection(db, 'organizations', orgId, 'loans');
      const q = query(loansRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
    } catch (error) {
      console.error('Error getting loans:', error);
      return [];
    }
  },

  async getLoansByStatus(orgId: string, status: LoanStatus): Promise<LoanApplication[]> {
    try {
      const loansRef = collection(db, 'organizations', orgId, 'loans');
      const q = query(loansRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
    } catch (error) {
      console.error('Error getting loans by status:', error);
      return [];
    }
  },

  async getLoansByMember(orgId: string, memberId: string): Promise<LoanApplication[]> {
    try {
      const loansRef = collection(db, 'organizations', orgId, 'loans');
      const q = query(loansRef, where('memberId', '==', memberId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
    } catch (error) {
      console.error('Error getting member loans:', error);
      return [];
    }
  },

  async getLoanById(orgId: string, loanId: string): Promise<LoanApplication | null> {
    try {
      const loanRef = doc(db, 'organizations', orgId, 'loans', loanId);
      const snapshot = await getDoc(loanRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as LoanApplication;
      }
      return null;
    } catch (error) {
      console.error('Error getting loan:', error);
      return null;
    }
  },

  async updateLoanStatus(
    orgId: string,
    loanId: string,
    status: LoanStatus,
    updatedBy?: string
  ): Promise<void> {
    try {
      const loanRef = doc(db, 'organizations', orgId, 'loans', loanId);
      await updateDoc(loanRef, {
        status,
        updatedAt: new Date(),
        ...(updatedBy && { updatedBy }),
        ...(status === 'completed' && { completedAt: new Date() })
      });
      console.log(`✅ Loan status updated to ${status}`);
    } catch (error) {
      console.error('Error updating loan status:', error);
      throw error;
    }
  },

  async addRepayment(
    orgId: string,
    loanId: string,
    memberId: string,
    amount: number,
    paymentType: PaymentType,
    referenceNo?: string,
    bankName?: string,
    bankReference?: string,
    collectionStatus?: CollectionStatus
  ): Promise<void> {
    try {
      const now = Timestamp.now();
      const loan = await this.getLoanById(orgId, loanId);
      if (!loan) throw new Error('Loan not found');
      
      const repaymentsRef = collection(db, 'organizations', orgId, 'loans', loanId, 'repayments');
      const existingRepayments = await getDocs(repaymentsRef);
      const installmentNo = existingRepayments.size + 1;
      
      const repaymentRef = doc(repaymentsRef);
      const rawLoanStartDate = loan.disbursedAt || loan.approvedAt || loan.createdAt;
      const parsedLoanStartDate = parseToDate(rawLoanStartDate) || now.toDate();
      const dueDate = new Date(parsedLoanStartDate);
      dueDate.setMonth(dueDate.getMonth() + installmentNo - 1); // Monthly installments
      
      const repayment: LoanRepayment = {
        id: repaymentRef.id,
        loanId,
        orgId,
        memberId,
        installmentNo,
        dueDate,
        dueAmount: loan.monthlyInstallment,
        paidAmount: amount,
        paidDate: now.toDate(),
        status: amount >= loan.monthlyInstallment ? 'paid' : 'partial',
        paymentType,
        referenceNo,
        bankName: bankName || '',
        bankReference: bankReference || '',
        collectionStatus,
        createdAt: now.toDate()
      };
      
      await setDoc(repaymentRef, repayment);
      
      const newPaidAmount = (loan.paidAmount || 0) + amount;
      const newDueAmount = loan.totalPayable - newPaidAmount;
      
      await updateDoc(doc(db, 'organizations', orgId, 'loans', loanId), {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        paidInstallments: installmentNo,
        remainingInstallments: loan.durationMonths - installmentNo,
        status: newDueAmount <= 0 ? 'completed' : 'active',
        updatedAt: now.toDate()
      });
      
      const memberRef = doc(db, 'organizations', orgId, 'members', memberId);
      
      // Calculate total loan balance across all loans for this member
      const allLoans = await this.getLoansByMember(orgId, memberId);
      const totalDueAmount = allLoans.reduce((sum, l) => sum + (l.dueAmount || 0), 0);
      const totalPaidAmount = allLoans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
      
      await updateDoc(memberRef, {
        'financials.currentLoanBalance': totalDueAmount,
        'financials.totalLoanPaid': totalPaidAmount,
        updatedAt: now.toDate()
      });
      
      console.log(`✅ Repayment added for loan ${loanId}`);
    } catch (error) {
      console.error('Error adding repayment:', error);
      throw error;
    }
  },

  async getRepayments(orgId: string, loanId: string): Promise<LoanRepayment[]> {
    try {
      const repaymentsRef = collection(db, 'organizations', orgId, 'loans', loanId, 'repayments');
      const q = query(repaymentsRef, orderBy('installmentNo', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanRepayment));
    } catch (error) {
      console.error('Error getting repayments:', error);
      return [];
    }
  },

  async getLoanStats(orgId: string): Promise<{
    totalLoans: number;
    totalAmount: number;
    activeLoans: number;
    pendingApproval: number;
    completedLoans: number;
    defaultedLoans: number;
    totalCollected: number;
  }> {
    try {
      const loans = await this.getAllLoans(orgId);
      return {
        totalLoans: loans.length,
        totalAmount: loans.reduce((sum, l) => sum + l.amount, 0),
        activeLoans: loans.filter(l => l.status === 'active').length,
        pendingApproval: loans.filter(l => l.status === 'pending').length,
        completedLoans: loans.filter(l => l.status === 'completed').length,
        defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
        totalCollected: loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0)
      };
    } catch (error) {
      console.error('Error getting loan stats:', error);
      return {
        totalLoans: 0,
        totalAmount: 0,
        activeLoans: 0,
        pendingApproval: 0,
        completedLoans: 0,
        defaultedLoans: 0,
        totalCollected: 0
      };
    }
  }
};

export default loanService;