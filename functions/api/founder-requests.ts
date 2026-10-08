const MAX_NAME = 80
const MAX_EMAIL = 200
const MAX_COUNTRY = 80
const MAX_NOTE = 600
const REQUESTS_PER_HOUR = 3

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function clean(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max)
}

async function bucketFor(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  const hour = new Date().toISOString().slice(0, 13)
  const input = new TextEncoder().encode('huar-founder:' + hour + ':' + ip)
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const onRequestPost = async (context: any) => {
  let body: any
  try {
    body = await context.request.json()
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  if (clean(body.website, 120)) return json({ ok: true }, 202)

  const name = clean(body.name, MAX_NAME + 1)
  const email = clean(body.email, MAX_EMAIL + 1).toLowerCase()
  const country = clean(body.country, MAX_COUNTRY + 1)
  const note = clean(body.note, MAX_NOTE + 1)
  const referral = clean(body.source_referral, 64) || null
  const sessionId = clean(body.session_id, 80) || null

  if (!name || name.length > MAX_NAME) return json({ error: 'Please enter your name.' }, 400)
  if (!email || email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email.' }, 400)
  }
  if (country.length > MAX_COUNTRY || note.length > MAX_NOTE) return json({ error: 'Please check the form.' }, 400)

  const bucket = await bucketFor(context.request)
  const current = await context.env.HUAR_DB.prepare(
    'SELECT count FROM rate_limits WHERE bucket_hash = ?'
  ).bind(bucket).first()

  if ((current?.count || 0) >= REQUESTS_PER_HOUR) {
    return json({ error: 'Too many requests from this connection. Please try again later.' }, 429)
  }

  const now = new Date().toISOString()
  const staleRateCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  await context.env.HUAR_DB.prepare('DELETE FROM rate_limits WHERE updated_at < ?')
    .bind(staleRateCutoff)
    .run()

  await context.env.HUAR_DB.prepare(
    `INSERT INTO rate_limits(bucket_hash, count, updated_at)
     VALUES(?, 1, ?)
     ON CONFLICT(bucket_hash) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`
  ).bind(bucket, now).run()

  const existing = await context.env.HUAR_DB.prepare(
    `SELECT id, status FROM founder_requests
     WHERE email = ? AND status IN ('new','contacted','accepted')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(email).first()

  if (existing) {
    return json({ ok: true, id: existing.id, status: existing.status, duplicate: true })
  }

  const id = crypto.randomUUID()

  await context.env.HUAR_DB.prepare(
    `INSERT INTO founder_requests
      (id, name, email, country, note, status, created_at, source_referral, session_id)
     VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?)`
  ).bind(id, name, email, country || null, note || null, now, referral, sessionId).run()

  await context.env.HUAR_DB.prepare(
    `INSERT INTO analytics_events(event_name, created_at, thought_id, referral_token, session_id, metadata_json)
     VALUES('founding_request_submitted', ?, NULL, ?, ?, ?)`
  ).bind(
    now,
    referral,
    sessionId,
    JSON.stringify({ country: country || null }).slice(0, 800),
  ).run()

  return json({ ok: true, id, status: 'new' }, 201)
}
