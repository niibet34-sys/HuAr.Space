function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function clean(value: unknown, max: number) {
  return typeof value === 'string'
    ? value.normalize('NFC').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max)
    : ''
}

async function findThought(db: any, token: string) {
  return db.prepare(
    `SELECT id, thought, display_name, created_at, status, share_token, epoch
     FROM thoughts WHERE share_token = ? OR id = ? LIMIT 1`
  ).bind(token, token).first()
}

export const onRequestGet = async (context: any) => {
  const item = await findThought(context.env.HUAR_DB, context.params.id)
  if (!item || item.status === 'rejected') return json({ error: 'Thought not found.' }, 404)

  return json({
    id: item.id,
    thought: item.thought,
    display_name: item.display_name,
    created_at: item.created_at,
    status: item.status,
    share_token: item.share_token,
    epoch: item.epoch,
    permalink: 'https://huar.space/thought/' + item.share_token,
  })
}

export const onRequestPatch = async (context: any) => {
  let body: any
  try { body = await context.request.json() } catch { return json({ error: 'Invalid request.' }, 400) }

  const email = clean(body.email, 200)
  const manageToken = clean(body.manage_token, 80)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email.' }, 400)
  }

  const item = await context.env.HUAR_DB.prepare(
    `SELECT id, status FROM thoughts
     WHERE (share_token = ? OR id = ?) AND manage_token = ? LIMIT 1`
  ).bind(context.params.id, context.params.id, manageToken).first()

  if (!item || item.status === 'rejected') return json({ error: 'Thought not found.' }, 404)

  await context.env.HUAR_DB.prepare('UPDATE thoughts SET optional_email = ? WHERE id = ?')
    .bind(email, item.id).run()

  return json({ ok: true })
}
