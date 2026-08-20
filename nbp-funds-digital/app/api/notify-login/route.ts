import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.log('[v0] Telegram env vars missing')
    return NextResponse.json({ error: 'Telegram is not configured.' }, { status: 500 })
  }

  let username: unknown
  try {
    const body = await request.json()
    username = body?.username
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof username !== 'string' || username.trim().length === 0) {
    return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
  }

  const sanitizedUsername = username.trim().slice(0, 200)
  const timestamp = new Date().toISOString()

  const text = [
    '🔐 *New login attempt*',
    `*Username:* ${escapeMarkdown(sanitizedUsername)}`,
    `*Time:* ${escapeMarkdown(timestamp)}`,
  ].join('\n')

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
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
