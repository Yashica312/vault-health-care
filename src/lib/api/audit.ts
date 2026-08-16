import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'record_created'
  | 'record_viewed'
  | 'record_updated'
  | 'record_deleted'
  | 'prescription_created'
  | 'prescription_updated'
  | 'prescription_deleted'
  | 'family_member_added'
  | 'family_member_updated'
  | 'family_member_deleted'
  | 'emergency_profile_updated';

/** Fire-and-forget audit trail. Never blocks or breaks the calling flow. */
export const logAction = async (
  action: AuditAction,
  entity?: { type?: string; id?: string | null; metadata?: Record<string, unknown> },
) => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from('audit_logs').insert({
      user_id: data.user.id,
      action,
      entity_type: entity?.type ?? null,
      entity_id: entity?.id ?? null,
      metadata: (entity?.metadata ?? null) as never,
    });
  } catch {
    /* audit logging must never surface to the user */
  }
};

export const listAuditLogs = async (limit = 20) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};