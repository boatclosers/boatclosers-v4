// Server-only: BoatClosers Express handoff photos, kept in a PRIVATE storage bucket and
// served only through the buyer's private link.
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const PHOTO_BUCKET = 'express-photos'

export async function ensurePhotoBucket() {
  try {
    const { data } = await supabaseAdmin.storage.getBucket(PHOTO_BUCKET)
    if (data) return
  } catch {}
  try {
    await supabaseAdmin.storage.createBucket(PHOTO_BUCKET, { public: false, fileSizeLimit: 3 * 1024 * 1024, allowedMimeTypes: ['image/jpeg'] })
  } catch {}
}

export function photoPath(dealId: string, photoId: string) {
  return `${dealId}/${photoId}.jpg`
}

export async function photoBytes(dealId: string, photoId: string): Promise<Uint8Array | null> {
  if (!/^[a-f0-9]{16,32}$/.test(photoId)) return null
  const { data, error } = await supabaseAdmin.storage.from(PHOTO_BUCKET).download(photoPath(dealId, photoId))
  if (error || !data) return null
  return new Uint8Array(await data.arrayBuffer())
}
