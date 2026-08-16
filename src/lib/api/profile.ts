import { supabase } from '@/integrations/supabase/client';
import type { Profile } from './types';

export const getProfile = async (): Promise<Profile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertProfile = async (input: { full_name: string; phone?: string | null; email?: string | null }) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in.');
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...input, user_id: auth.user.id }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};