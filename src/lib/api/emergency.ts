import { supabase } from '@/integrations/supabase/client';
import { logAction } from './audit';
import type { EmergencyProfile } from './types';

export const getEmergencyProfile = async (familyMemberId: string): Promise<EmergencyProfile | null> => {
  const { data, error } = await supabase
    .from('emergency_profiles')
    .select('*')
    .eq('family_member_id', familyMemberId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export interface EmergencyInput {
  family_member_id: string;
  full_name: string;
  blood_group?: string | null;
  allergies?: string[];
  emergency_contact?: string | null;
  current_medications?: string[];
  critical_conditions?: string[];
}

export const upsertEmergencyProfile = async (input: EmergencyInput) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in.');
  const { data, error } = await supabase
    .from('emergency_profiles')
    .upsert({ ...input, user_id: auth.user.id }, { onConflict: 'family_member_id' })
    .select()
    .single();
  if (error) throw error;
  await logAction('emergency_profile_updated', { type: 'emergency_profile', id: data.id });
  return data;
};