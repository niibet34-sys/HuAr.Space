const MAX_PREVIEW_BYTES = 350_000

function toBase64(bytes: Uint8Array) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)))
  }
  return btoa(binary)
}

export const onRequestPut = async (context: any) => {
  const token = String(context.params.id || '')
  const contentType = context.request.headers.get('content-type') || ''
  if (!contentType.startsWith('image/jpeg')) {
    return new Response('JPEG required', { status: 415 })
  }

  const item = await context.env.HUAR_DB.prepare(
    'SELECT share_token, status FROM thoughts WHERE share_token = ? LIMIT 1'
  ).bind(token).first()

  if (!item || item.status === 'rejected') return new Response('Not found', { status: 404 })

  const buffer = await context.request.arrayBuffer()
  if (!buffer.byteLength || buffer.byteLength > MAX_PREVIEW_BYTES) {
    return new Response('Preview too large', { status: 413 })
  }

  const base64 = toBase64(new Uint8Array(buffer))
  await context.env.HUAR_DB.prepare(
    `INSERT INTO thought_cards(share_token, image_base64, mime_type, created_at)
     VALUES(?, ?, 'image/jpeg', ?)
     ON CONFLICT(share_token) DO UPDATE SET
       image_base64 = excluded.image_base64,
       mime_type = excluded.mime_type,
       created_at = excluded.created_at`
  ).bind(token, base64, new Date().toISOString()).run()

  return new Response(null, { status: 204 })
}
