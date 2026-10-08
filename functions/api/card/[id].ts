function esc(value: unknown) {
  return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function wrap(text: string, limit = 28) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? line + ' ' + word : word
    if (next.length > limit && line) { lines.push(line); line = word }
    else line = next
  }
  if (line) lines.push(line)
  return lines.slice(0, 8)
}

export const onRequestGet = async (context: any) => {
  const token = String(context.params.id || '')
  const item = await context.env.HUAR_DB.prepare(
    `SELECT thought, display_name, status, epoch FROM thoughts WHERE share_token = ? LIMIT 1`
  ).bind(token).first()

  if (!item || item.status === 'rejected') return new Response('Not found', { status: 404 })

  const lines = wrap(String(item.thought), 28)
  const tspans = lines.map((line, i) =>
    '<tspan x="90" dy="' + (i === 0 ? 0 : 74) + '">' + esc(line) + '</tspan>'
  ).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
<defs><radialGradient id="g" cx="70%" cy="18%" r="75%"><stop offset="0" stop-color="#172440"/><stop offset=".45" stop-color="#07101d"/><stop offset="1" stop-color="#02040a"/></radialGradient><linearGradient id="line"><stop stop-color="#9fb5e8" stop-opacity=".7"/><stop offset="1" stop-color="#9fb5e8" stop-opacity="0"/></linearGradient></defs>
<rect width="1080" height="1350" fill="url(#g)"/>
<circle cx="842" cy="204" r="2" fill="#dce8ff"/><circle cx="713" cy="151" r="1.2" fill="#8095bf"/><circle cx="928" cy="417" r="1.6" fill="#a9b8d6"/><circle cx="174" cy="260" r="1.3" fill="#8fa4cb"/><circle cx="248" cy="1100" r="1.2" fill="#b3c2df"/>
<text x="90" y="105" fill="#f5f7fc" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="7">HUAR.SPACE</text>
<text x="90" y="220" fill="#75839f" font-family="Arial,sans-serif" font-size="18" font-weight="600" letter-spacing="5">A THOUGHT FOR HUMANITY</text>
<rect x="90" y="270" width="250" height="2" fill="url(#line)"/>
<text x="90" y="430" fill="#f4f5f8" font-family="Georgia,serif" font-size="62" letter-spacing="-1.5">“</text>
<text x="90" y="505" fill="#f4f5f8" font-family="Georgia,serif" font-size="62" letter-spacing="-1.5">` + tspans + `</text>
<text x="90" y="1080" fill="#d8dfef" font-family="Arial,sans-serif" font-size="23" font-weight="600" letter-spacing="4">` + esc(String(item.display_name).toUpperCase()) + `</text>
<text x="90" y="1130" fill="#75839f" font-family="Arial,sans-serif" font-size="17" letter-spacing="4">` + esc(item.epoch) + ` FOUNDING ARCHIVE</text>
<line x1="90" y1="1210" x2="990" y2="1210" stroke="#ffffff" stroke-opacity=".11"/>
<text x="90" y="1270" fill="#707b91" font-family="Arial,sans-serif" font-size="15" letter-spacing="3">ONE HUMAN · ONE THOUGHT · ONCE A DECADE</text>
<text x="990" y="1270" text-anchor="end" fill="#c7d2e7" font-family="Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="2">HUAR.SPACE</text>
</svg>`

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': item.status === 'approved' ? 'public, max-age=86400' : 'private, max-age=60',
    },
  })
}
