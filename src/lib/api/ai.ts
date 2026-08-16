import { supabase } from '@/integrations/supabase/client';
import type { AIRecordSummary } from './types';

/** Generates a clinical summary server-side (Edge Function) — no API keys in the browser. */
export const generateRecordSummary = async (payload: {
  recordId?: string;
  title: string;
  recordType: string;
  category: string;
  extractedText?: string | null;
  notes?: string | null;
  recordDate?: string;
}): Promise<AIRecordSummary> => {
  const { data, error } = await supabase.functions.invoke('ai-summarize', { body: payload });
  if (error) throw new Error(error.message || 'AI summary failed. Please try again.');
  if (!data?.summary) throw new Error(data?.error || 'AI summary is unavailable right now.');
  return data.summary as AIRecordSummary;
};