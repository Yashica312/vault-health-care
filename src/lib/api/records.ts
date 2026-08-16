import { supabase } from '@/integrations/supabase/client';
import { logAction } from './audit';
import { removeMedicalFile } from './storage';
import type { MedicalRecord, MedicalRecordInsert, MedicalRecordUpdate } from './types';

export const listRecords = async (familyMemberId?: string | null): Promise<MedicalRecord[]> => {
  let query = supabase.from('medical_records').select('*').order('record_date', { ascending: false });
  if (familyMemberId) query = query.eq('family_member_id', familyMemberId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getRecord = async (id: string): Promise<MedicalRecord | null> => {
  const { data, error } = await supabase.from('medical_records').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};

export const createRecord = async (
  input: Omit<MedicalRecordInsert, 'user_id'>,
): Promise<MedicalRecord> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in.');
  const { data, error } = await supabase
    .from('medical_records')
    .insert({ ...input, user_id: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  await logAction('record_created', { type: 'medical_record', id: data.id });
  return data;
};

export const updateRecord = async (id: string, patch: MedicalRecordUpdate) => {
  const { data, error } = await supabase.from('medical_records').update(patch).eq('id', id).select().single();
  if (error) throw error;
  await logAction('record_updated', { type: 'medical_record', id });
  return data;
};

export const deleteRecord = async (record: MedicalRecord) => {
  const { error } = await supabase.from('medical_records').delete().eq('id', record.id);
  if (error) throw error;
  if (record.file_path) await removeMedicalFile(record.file_path);
  await logAction('record_deleted', { type: 'medical_record', id: record.id });
};