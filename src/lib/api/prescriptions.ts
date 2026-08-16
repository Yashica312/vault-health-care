import { supabase } from '@/integrations/supabase/client';
import { logAction } from './audit';
import type { Medication, PrescriptionWithMeds } from './types';

export const listPrescriptions = async (familyMemberId?: string | null): Promise<PrescriptionWithMeds[]> => {
  let query = supabase
    .from('prescriptions')
    .select('*, medications(*)')
    .order('prescribed_date', { ascending: false });
  if (familyMemberId) query = query.eq('family_member_id', familyMemberId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PrescriptionWithMeds[];
};

export interface MedicationInput {
  name: string;
  dosage: string;
  timing: string[];
  with_food: boolean;
  duration_days: number;
  days_completed?: number;
  instructions?: string | null;
  reminder_enabled?: boolean;
}

export interface PrescriptionInput {
  family_member_id: string;
  doctor_name: string;
  doctor_id?: string | null;
  diagnosis: string;
  prescribed_date: string;
  duration_days: number;
  end_date?: string | null;
  notes?: string | null;
  is_active?: boolean;
  medications: MedicationInput[];
}

export const createPrescription = async (input: PrescriptionInput) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in.');
  const { medications, ...rx } = input;
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({ ...rx, user_id: auth.user.id })
    .select()
    .single();
  if (error) throw error;

  if (medications.length) {
    const { error: medError } = await supabase.from('medications').insert(
      medications.map((m) => ({ ...m, prescription_id: data.id, user_id: auth.user!.id })),
    );
    if (medError) throw medError;
  }
  await logAction('prescription_created', { type: 'prescription', id: data.id });
  return data;
};

export const updatePrescription = async (
  id: string,
  patch: Partial<Omit<PrescriptionInput, 'medications'>>,
) => {
  const { data, error } = await supabase.from('prescriptions').update(patch).eq('id', id).select().single();
  if (error) throw error;
  await logAction('prescription_updated', { type: 'prescription', id });
  return data;
};

export const deletePrescription = async (id: string) => {
  const { error } = await supabase.from('prescriptions').delete().eq('id', id);
  if (error) throw error;
  await logAction('prescription_deleted', { type: 'prescription', id });
};

export const updateMedication = async (id: string, patch: Partial<Medication>) => {
  const { error } = await supabase.from('medications').update(patch).eq('id', id);
  if (error) throw error;
};