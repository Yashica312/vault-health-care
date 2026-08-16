import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type FamilyMember = Tables<'family_members'>;
export type FamilyMemberInsert = TablesInsert<'family_members'>;
export type FamilyMemberUpdate = TablesUpdate<'family_members'>;
export type MedicalRecord = Tables<'medical_records'>;
export type MedicalRecordInsert = TablesInsert<'medical_records'>;
export type MedicalRecordUpdate = TablesUpdate<'medical_records'>;
export type Prescription = Tables<'prescriptions'>;
export type Medication = Tables<'medications'>;
export type Doctor = Tables<'doctors'>;
export type AppNotification = Tables<'notifications'>;
export type EmergencyProfile = Tables<'emergency_profiles'>;
export type AuditLog = Tables<'audit_logs'>;

export type RecordType = Enums<'record_type'>;
export type RecordCategory = Enums<'record_category'>;
export type RelationType = Enums<'relation_type'>;
export type NotificationType = Enums<'notification_type'>;

export type PrescriptionWithMeds = Prescription & { medications: Medication[] };

export interface AIRecordSummary {
  diagnosis: string;
  findings: string[];
  abnormalValues: { label: string; value: string; range: string; severity: 'high' | 'low' | 'borderline' }[];
  followUpDate?: string | null;
  confidence: number;
}

/** Narrow the jsonb ai_summary column into the shape the UI renders. */
export const parseAiSummary = (value: unknown): AIRecordSummary | null => {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.diagnosis !== 'string') return null;
  return {
    diagnosis: v.diagnosis,
    findings: Array.isArray(v.findings) ? (v.findings as string[]) : [],
    abnormalValues: Array.isArray(v.abnormalValues) ? (v.abnormalValues as AIRecordSummary['abnormalValues']) : [],
    followUpDate: typeof v.followUpDate === 'string' ? v.followUpDate : null,
    confidence: typeof v.confidence === 'number' ? v.confidence : 0.8,
  };
};