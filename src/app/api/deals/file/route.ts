import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/deals/file?dealId=...&docId=...&k=...
// Streams an uploaded deal document from the private bucket. The random key is
// stored on the deal and only shown to its parties, so this link works in a
// normal <a href> (no sign-in header) without making the file public.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const dealId = u.searchParams.get('dealId') || '';
  const docId = u.searchParams.get('docId') || '';
  const k = u.searchParams.get('k') || '';
  if (!dealId || !docId || !/^[a-f0-9]{36}$/.test(k)) return new Response('Not found.', { status: 404 });

  const { data: deal } = await supabaseAdmin.from('deals').select('negotiate').eq('id', dealId).maybeSingle();
  const up = (deal?.negotiate as any)?.uploads?.[docId];
  // The path must belong to this deal: negotiate is saved by the browser, so never
  // trust it to point somewhere else in the bucket.
  if (!up?.path || up.key !== k || !String(up.path).startsWith(`${dealId}/`) || String(up.path).includes('..')) {
    return new Response('Not found.', { status: 404 })
  }

  const { data, error } = await supabaseAdmin.storage.from('deal-docs').download(up.path);
  if (error || !data) return new Response('File unavailable.', { status: 404 });
  const name = String(up.name || 'file').replace(/[^a-zA-Z0-9._ -]/g, '_');
  return new Response(data, {
    headers: {
      'Content-Type': up.type || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${name}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
