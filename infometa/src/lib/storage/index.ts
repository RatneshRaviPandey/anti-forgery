import { createClient } from '@supabase/supabase-js';

function createStorageClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ).storage;
}

const storage = createStorageClient();
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'infometa-assets';

export async function uploadFile(path: string, file: Buffer, contentType: string) {
  if (!storage) return null;
  const { data, error } = await storage.from(BUCKET).upload(path, file, { contentType, upsert: true });
  if (error) throw error;
  return data;
}

export async function getPublicUrl(path: string): Promise<string | null> {
  if (!storage) return null;
  const { data } = storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(path: string) {
  if (!storage) return null;
  const { error } = await storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
