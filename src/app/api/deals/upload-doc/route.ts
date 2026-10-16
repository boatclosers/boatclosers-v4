import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Stores an uploaded document (survey report, deposit proof, signed paper) in a
// PRIVATE storage bucket and records it in the deal's negotiate.uploads map, so
// both parties see it after a refresh. Only a signed-in party to the deal can
// upload. The stored link is /api/deals/file?...&k=<random key>: only people who
// can see the deal ever see the key, and the file route checks it.
const BUCKET = 'deal-docs';
const MAX_BYTES = 8 * 1024 * 1024;

async function ensureBucket() {
  try {
    const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
    if (data) return;
  } catch (e) { /* not found — fall through to create */ }
  try { await supabaseAdmin.storage.createBucket(BUCKET, { public: false }); } catch (e) { /* may already exist */ }
}

async function userId(req: Request): Promise<string | null> {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const uid = await userId(req);
    if (!uid) return NextResponse.json({ error: 'Please sign in again, then upload.' }, { status: 401 });

    const { dealId, docId, filename, contentType, base64 } = await req.json();
    if (!dealId || !docId || !base64) {
      return NextResponse.json({ error: 'Missing dealId, docId, or file data.' }, { status: 400 });
    }
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(String(docId))) {
      return NextResponse.json({ error: 'Invalid document.' }, { status: 400 });
    }

    const { data: deal } = await supabaseAdmin
      .from('deals')
      .select('id, negotiate, initiator_id, other_party_id, party_a_user_id, party_b_user_id')
      .eq('id', dealId)
      .maybeSingle();
    if (!deal) return NextResponse.json({ error: 'Deal not found.' }, { status: 404 });
    const parties = [deal.initiator_id, deal.other_party_id, deal.party_a_user_id, deal.party_b_user_id].filter(Boolean);
    if (!parties.includes(uid)) return NextResponse.json({ error: 'Not a party to this deal.' }, { status: 403 });

    const buffer = Buffer.from(String(base64), 'base64');
    if (buffer.length > MAX_BYTES) return NextResponse.json({ error: 'That file is larger than 8MB.' }, { status: 413 });
    const type = String(contentType || '');
    if (!/^(application\/pdf|image\/(jpeg|png))$/.test(type)) {
      return NextResponse.json({ error: 'Upload a PDF, JPG, or PNG.' }, { status: 400 });
    }

    await ensureBucket();
    const safeName = String(filename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const path = `${deal.id}/${docId}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, { contentType: type, upsert: true });
    if (upErr) return NextResponse.json({ error: 'Storage upload failed: ' + upErr.message }, { status: 500 });

    const key = crypto.randomBytes(18).toString('hex');
    const url = `/api/deals/file?dealId=${encodeURIComponent(deal.id)}&docId=${encodeURIComponent(docId)}&k=${key}`;

    const negotiate: any = (deal.negotiate && typeof deal.negotiate === 'object') ? deal.negotiate : {};
    const uploads: any = (negotiate.uploads && typeof negotiate.uploads === 'object') ? negotiate.uploads : {};
    uploads[docId] = { name: filename || 'file', url, path, key, type, at: Date.now(), by: uid };
    negotiate.uploads = uploads;
    await supabaseAdmin.from('deals').update({ negotiate }).eq('id', deal.id);

    return NextResponse.json({ success: true, url });
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
