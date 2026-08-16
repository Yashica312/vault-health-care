import { supabase } from '@/integrations/supabase/client';
import { logAction } from './audit';
import type { FamilyMember, FamilyMemberInsert, FamilyMemberUpdate } from './types';

export const listFamilyMembers = async (): Promise<FamilyMember[]> => {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const addFamilyMember = async (
  input: Omit<FamilyMemberInsert, 'user_id'>,
): Promise<FamilyMember> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in.');
  const { data, error } = await supabase
    .from('family_members')
    .insert({ ...input, user_id: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  await logAction('family_member_added', { type: 'family_member', id: data.id });
  return data;
};

export const updateFamilyMember = async (id: string, patch: FamilyMemberUpdate) => {
  const { data, error } = await supabase
    .from('family_members')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  await logAction('family_member_updated', { type: 'family_member', id });
  return data;
};

export const deleteFamilyMember = async (id: string) => {
  const { error } = await supabase.from('family_members').delete().eq('id', id);
  if (error) throw error;
  await logAction('family_member_deleted', { type: 'family_member', id });
};