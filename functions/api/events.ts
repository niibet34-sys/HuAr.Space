const ALLOWED = new Set([
  'leave_thought_cta_clicked',
  'thought_started',
  'thought_submitted',
  'thought_card_generated',
  'thought_share_clicked',
  'thought_downloaded',
  'thought_link_copied',
  'referral_visitor_arrived',
  'referral_thought_submitted',
  'referral_first100_clicked',
  'thought_email_added',
  'founding_request_opened',
])

function clean(value: unknown, max: number) {
  return typeof value === 'string'
    ? value.normalize('NFC').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max)
    : ''
}

export const onRequestPost = async (context: any) => {
  let body: any
  try { body = await context.request.json() } catch { return new Response(null, { status: 204 }) }

  const event = clean(body.event, 64)
  if (!ALLOWED.has(event)) return new Response(null, { status: 204 })

  const thoughtId = clean(body.thought_id, 80) || null
  const referral = clean(body.referral_token, 80) || null
  const session = clean(body.session_id, 80) || null
  const metadata = JSON.stringify(body.metadata && typeof body.metadata === 'object' ? body.metadata : {}).slice(0, 1500)

  await context.env.HUAR_DB.prepare(
    `INSERT INTO analytics_events(event_name, created_at, thought_id, referral_token, session_id, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(event, new Date().toISOString(), thoughtId, referral, session, metadata).run()

  return new Response(null, { status: 204 })
}
