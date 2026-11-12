// The connector link a customer adds to their own AI. It speaks MCP (Model Context
// Protocol) over plain HTTP, which ChatGPT, Claude and other assistants support.
// Each request stands alone; nothing is kept between them.
import { NextResponse } from 'next/server'
import { userForToken } from '@/lib/aiLink'
import { callTool, INSTRUCTIONS, SERVER_INFO, TOOLS, ToolError } from '@/lib/mcp'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']
type Rpc = { jsonrpc: '2.0'; id?: string | number | null; method: string; params?: Record<string, unknown> }
const ok = (id: Rpc['id'], result: unknown) => ({ jsonrpc: '2.0', id, result })
const fail = (id: Rpc['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } })

async function handle(msg: Rpc, ctx: { userId: string }) {
  switch (msg.method) {
    case 'initialize': {
      const asked = String(msg.params?.protocolVersion ?? '')
      return ok(msg.id, {
        protocolVersion: VERSIONS.includes(asked) ? asked : VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      })
    }
    case 'ping':
      return ok(msg.id, {})
    case 'tools/list':
      return ok(msg.id, { tools: TOOLS })
    case 'tools/call': {
      const name = String(msg.params?.name ?? '')
      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>
      try {
        const out = await callTool(ctx, name, args)
        return ok(msg.id, { content: [{ type: 'text', text: JSON.stringify(out) }], structuredContent: out })
      } catch (e) {
        if (e instanceof ToolError) return ok(msg.id, { content: [{ type: 'text', text: e.message }], isError: true })
        console.error('mcp tool failed', name, e)
        return ok(msg.id, { content: [{ type: 'text', text: 'Something went wrong on our side. Try again in a moment.' }], isError: true })
      }
    }
    default:
      return msg.id === undefined ? null : fail(msg.id, -32601, `Method not found: ${msg.method}`)
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const ctx = await userForToken(params.token)
  if (!ctx) return NextResponse.json(fail(null, -32001, 'This link is not valid or was turned off. Make a new one in BoatClosers.'), { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json(fail(null, -32700, 'Parse error'), { status: 400 })
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m: Rpc) => handle(m, ctx)))).filter(Boolean)
    return out.length ? NextResponse.json(out) : new NextResponse(null, { status: 202 })
  }
  const out = await handle(body as Rpc, ctx)
  return out ? NextResponse.json(out) : new NextResponse(null, { status: 202 })
}

// Opened in a browser, the link just says whether it works.
export async function GET(request: Request, { params }: { params: { token: string } }) {
  if ((request.headers.get('accept') ?? '').includes('text/event-stream'))
    return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
  const ctx = await userForToken(params.token)
  return NextResponse.json(
    ctx
      ? { ok: true, message: 'This BoatClosers link works. Add it to your AI assistant as a connector.' }
      : { ok: false, message: 'This link is not valid or was turned off. Make a new one in BoatClosers.' },
    { status: ctx ? 200 : 404 },
  )
}
