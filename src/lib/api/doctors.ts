import { supabase } from '@/integrations/supabase/client';
import type { Doctor } from './types';

export const listDoctors = async (): Promise<Doctor[]> => {
  const { data, error } = await supabase.from('doctors').select('*').order('rating', { ascending: false });
  if (error) throw error;
  return data;
};

export const getDoctor = async (id: string): Promise<Doctor | null> => {
  const { data, error } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};