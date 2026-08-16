import { supabase } from '@/integrations/supabase/client';
import type { AppNotification, NotificationType } from './types';

export const listNotifications = async (): Promise<AppNotification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createNotification = async (input: {
  type: NotificationType;
  title: string;
  message: string;
}) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const { error } = await supabase.from('notifications').insert({ ...input, user_id: auth.user.id });
  if (error) throw error;
};

export const markNotificationRead = async (id: string) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
};

export const markAllNotificationsRead = async () => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  if (error) throw error;
};

export const deleteNotification = async (id: string) => {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
};