import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Stores an uploaded document file in Supabase Storage and records its URL in the
// deal's negotiate.uploads map, so the file persists across refreshes and BOTH
// parties can see it (negotiate is the part of the deal that syncs between them).
const BUCKET = 'deal-docs';

async function ensureBucket() {
  try {
    const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
    if (data) return;
  } catch (e) { /* not found — fall through to create */ }
  try { await supabaseAdmin.storage.createBucket(BUCKET, { public: true }); } catch (e) { /* may already exist */ }
}

export async function POST(req: Request) {
  try {
    const { dealId, docId, filename, contentType, base64 } = await req.json();
    if (!dealId || !docId || !base64) {
      return NextResponse.json({ error: 'Missing dealId, docId, or file data.' }, { status: 400 });
    }

    await ensureBucket();

    const buffer = Buffer.from(base64, 'base64');
    const safeName = String(filename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${dealId}/${docId}/${Date.now()}_${safeName}`;

    const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
      contentType: contentType || 'application/octet-stream',
      upsert: true,
    });
    if (upErr) {
      return NextResponse.json({ error: 'Storage upload failed: ' + upErr.message }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const url = pub?.publicUrl || '';

    // Record in negotiate.uploads so both parties see it via the normal sync.
    const { data: deal } = await supabaseAdmin.from('deals').select('negotiate').eq('id', dealId).single();
    const negotiate: any = (deal?.negotiate && typeof deal.negotiate === 'object') ? deal.negotiate : {};
    const uploads: any = (negotiate.uploads && typeof negotiate.uploads === 'object') ? negotiate.uploads : {};
    uploads[docId] = { name: filename || 'file', url, at: Date.now() };
    negotiate.uploads = uploads;
    await supabaseAdmin.from('deals').update({ negotiate }).eq('id', dealId);

    return NextResponse.json({ success: true, url });
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
