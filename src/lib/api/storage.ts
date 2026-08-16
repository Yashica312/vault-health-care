import { supabase } from '@/integrations/supabase/client';

export const MEDICAL_BUCKET = 'medical-files';
export const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export const validateMedicalFile = (file: File): string | null => {
  if (!ACCEPTED_MIME.includes(file.type)) return 'Only PDF, JPG and PNG files are supported.';
  if (file.size > MAX_FILE_BYTES) return 'File is larger than 20 MB.';
  return null;
};

/** Uploads into <user-id>/<uuid>.<ext> — storage policies scope access to that folder. */
export const uploadMedicalFile = async (file: File): Promise<string> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in to upload.');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDICAL_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
};

export const getSignedUrl = async (path: string, expiresIn = 300): Promise<string> => {
  const { data, error } = await supabase.storage.from(MEDICAL_BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
};

export const removeMedicalFile = async (path: string) => {
  await supabase.storage.from(MEDICAL_BUCKET).remove([path]);
};