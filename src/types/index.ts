export type UserRole = 'patient' | 'doctor' | 'hospital';
export type DoctorVerificationStatus = 'pending' | 'verified' | 'rejected';
export type RecordType = 'prescription' | 'lab-report' | 'scan' | 'discharge' | 'diagnosis' | 'note' | 'other';
export type RecordCategory =
  | 'cardiology'
  | 'radiology'
  | 'pathology'
  | 'endocrinology'
  | 'pulmonology'
  | 'orthopedics'
  | 'dermatology'
  | 'pediatrics'
  | 'general'
  | 'uncategorized';

export interface AIRecordSummary {
  diagnosis: string;
  findings: string[];
  abnormalValues: { label: string; value: string; range: string; severity: 'high' | 'low' | 'borderline' }[];
  followUpDate?: string;
  confidence: number;
}
export type Relation = 'self' | 'spouse' | 'parent' | 'child' | 'sibling' | 'other';

export interface Profile {
  id: string;
  name: string;
  relation: Relation;
  age: number;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string[];
  avatarColor?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  profiles: Profile[];
  activeProfileId: string;
  // Doctor-specific
  specialization?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  verificationStatus?: DoctorVerificationStatus;
  hospitalAffiliation?: string;
}

export interface MedicalRecord {
  id: string;
  profileId: string;
  title: string;
  type: RecordType;
  date: string;
  doctorName?: string;
  hospitalName?: string;
  tags: string[];
  fileType: 'pdf' | 'image';
  fileSizeKB: number;
  notes?: string;
  extractedText?: string;
  thumbnailColor?: string;
  category?: RecordCategory;
  categoryConfidence?: number;
  aiSummary?: AIRecordSummary;
}

export interface Prescription {
  id: string;
  profileId: string;
  doctorName: string;
  doctorId: string;
  prescribedDate: string;
  diagnosis: string;
  medications: Medication[];
  durationDays: number;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: ('morning' | 'afternoon' | 'night')[];
  withFood: boolean;
  reminderEnabled: boolean;
  durationDays: number;
  daysCompleted: number;
  instructions?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  licenseNumber: string;
  yearsExperience: number;
  rating: number;
  hospital: string;
  verificationStatus: DoctorVerificationStatus;
  avatarColor: string;
  bio?: string;
}

export interface AppNotification {
  id: string;
  type: 'reminder' | 'prescription' | 'checkup' | 'security';
  title: string;
  message: string;
  time: string;
  read: boolean;
}