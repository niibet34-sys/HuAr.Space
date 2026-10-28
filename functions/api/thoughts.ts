const MAX_THOUGHT = 280
const MAX_NAME = 60
const SUBMISSIONS_PER_HOUR = 5

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function plainText(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max)
}

function token(length = 12) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => (b % 36).toString(36)).join('')
}

async function rateBucket(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  const hour = new Date().toISOString().slice(0, 13)
  const input = new TextEncoder().encode('huar:' + hour + ':' + ip)
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const onRequestPost = async (context: any) => {
  const request = context.request as Request
  let body: any

  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  if (plainText(body.website, 120)) return json({ ok: true }, 202)

  const thought = plainText(body.thought, MAX_THOUGHT + 1)
  const displayName = body.anonymous ? 'Anonymous' : plainText(body.display_name, MAX_NAME + 1)
  const consent = body.consent_public === true

  if (!thought || thought.length > MAX_THOUGHT) {
    return json({ error: 'Thought must be between 1 and 280 characters.' }, 400)
  }
  if (!displayName || displayName.length > MAX_NAME) {
    return json({ error: 'Display name must be between 1 and 60 characters.' }, 400)
  }
  if (!consent) return json({ error: 'Public display consent is required.' }, 400)

  const bucket = await rateBucket(request)
  const current = await context.env.HUAR_DB
    .prepare('SELECT count FROM rate_limits WHERE bucket_hash = ?')
    .bind(bucket)
    .first()

  if ((current?.count || 0) >= SUBMISSIONS_PER_HOUR) {
    return json({ error: 'Too many submissions from this connection. Please try again later.' }, 429)
  }

  const now = new Date().toISOString()
  const staleRateCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  await context.env.HUAR_DB.prepare('DELETE FROM rate_limits WHERE updated_at < ?')
    .bind(staleRateCutoff)
    .run()

  await context.env.HUAR_DB
    .prepare(`INSERT INTO rate_limits(bucket_hash, count, updated_at)
      VALUES(?, 1, ?)
      ON CONFLICT(bucket_hash) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`)
    .bind(bucket, now)
    .run()

  const id = crypto.randomUUID()
  const shareToken = token(10)
  const manageToken = token(24)
  const referral = plainText(body.source_referral, 64) || null
  const channel = plainText(body.source_channel, 64) || null

  await context.env.HUAR_DB.prepare(
    `INSERT INTO thoughts
      (id, thought, display_name, created_at, status, source_referral, source_channel, consent_public, share_token, manage_token, epoch)
     VALUES (?, ?, ?, ?, 'pending', ?, ?, 1, ?, ?, 2030)`
  ).bind(id, thought, displayName, now, referral, channel, shareToken, manageToken).run()

  await context.env.HUAR_DB.prepare(
    `INSERT INTO analytics_events(event_name, created_at, thought_id, referral_token, session_id, metadata_json)
     VALUES('thought_submitted', ?, ?, ?, ?, ?)`
  ).bind(
    now,
    id,
    referral,
    plainText(body.session_id, 80) || null,
    JSON.stringify({ source_channel: channel, referred: Boolean(referral) }).slice(0, 1500)
  ).run()

  return json({
    ok: true,
    id,
    share_token: shareToken,
    manage_token: manageToken,
    thought,
    display_name: displayName,
    created_at: now,
    status: 'pending',
    epoch: 2030,
    permalink: 'https://huar.space/thought/' + shareToken,
  }, 201)
}
