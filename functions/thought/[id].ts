function escapeHtml(input: unknown) {
  return String(input ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

export const onRequestGet = async (context: any) => {
  const token = String(context.params.id || '')
  const item = await context.env.HUAR_DB.prepare(
    `SELECT thought, display_name, created_at, status, share_token, epoch
     FROM thoughts WHERE share_token = ? LIMIT 1`
  ).bind(token).first()

  if (!item || item.status === 'rejected') {
    return new Response('Thought not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  }

  const name = escapeHtml(item.display_name)
  const thought = escapeHtml(item.thought)
  const title = item.display_name === 'Anonymous'
    ? 'A thought for humanity · HUAR'
    : name + ' left a thought for humanity · HUAR'
  const description = String(item.thought).slice(0, 180)
  const invite = item.display_name === 'Anonymous'
    ? 'Someone left a thought for humanity. What would you leave?'
    : name + ' left a thought for humanity. What would you leave?'
  const canonical = 'https://huar.space/thought/' + encodeURIComponent(token)
  const image = 'https://huar.space/api/card/' + encodeURIComponent(token)
  const referralHref = 'https://huar.space/?ref=' + encodeURIComponent(token) + '#leave-a-thought'
  const robots = item.status === 'approved' ? 'index,follow' : 'noindex,nofollow'

  const html = '<!doctype html>' +
`<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />` +
'<title>' + title + '</title>' +
'<meta name="description" content="' + escapeHtml(description) + '" />' +
'<meta name="robots" content="' + robots + '" />' +
'<link rel="canonical" href="' + canonical + '" />' +
'<meta property="og:type" content="website" />' +
'<meta property="og:site_name" content="HUAR · Human Archive Space" />' +
'<meta property="og:title" content="' + title + '" />' +
'<meta property="og:description" content="' + escapeHtml(description) + '" />' +
'<meta property="og:url" content="' + canonical + '" />' +
'<meta property="og:image" content="' + image + '" />' +
'<meta property="og:image:type" content="image/svg+xml" />' +
'<meta property="og:image:width" content="1080" /><meta property="og:image:height" content="1350" />' +
'<meta name="twitter:card" content="summary_large_image" />' +
'<meta name="twitter:title" content="' + title + '" />' +
'<meta name="twitter:description" content="' + escapeHtml(description) + '" />' +
'<meta name="twitter:image" content="' + image + '" />' +
`<style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#02040a;color:#f6f7fb;font-family:Arial,sans-serif}
body{min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 50% 18%,#10172b 0,transparent 36%),#02040a}
.shell{width:min(920px,92vw);padding:48px 0 64px}.brand{font-size:13px;letter-spacing:.28em;font-weight:700;margin-bottom:72px}
.card{padding:clamp(30px,7vw,76px);border:1px solid rgba(255,255,255,.12);background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.005));box-shadow:0 40px 100px rgba(0,0,0,.35)}
.kicker{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#75809a;margin-bottom:32px}
.quote{font-family:Georgia,serif;font-size:clamp(35px,6vw,68px);line-height:1.07;letter-spacing:-.04em;margin:0;max-width:16ch}
.meta{margin-top:34px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8e98af}
.invite{margin:52px 0 20px;font-family:Georgia,serif;font-size:clamp(25px,4vw,40px);line-height:1.15;max-width:19ch}
.cta{display:inline-flex;padding:15px 20px;border:1px solid rgba(255,255,255,.24);color:#fff;text-decoration:none;font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.note{margin-top:22px;color:#667087;font-size:11px;line-height:1.6}.foot{margin-top:60px;color:#4d566b;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
</style></head><body><main class="shell"><div class="brand">HUAR.SPACE</div><section class="card"><div class="kicker">A thought for humanity · ` +
escapeHtml(item.epoch) + ` epoch</div><p class="quote">“` + thought + `”</p><div class="meta">` + name +
` · Human Archive Space</div></section><h1 class="invite">` + invite + `</h1><a class="cta" href="` + referralHref +
`">Leave your thought</a><p class="note">Submitting a thought joins the public HUAR conversation. The First 100 are a separate founding circle.</p><div class="foot">One human · one thought · once a decade</div></main>
<script>
try {
  var s = localStorage.huar_session || (localStorage.huar_session = crypto.randomUUID());
  fetch('/api/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:'referral_visitor_arrived',referral_token:'` +
escapeHtml(token) + `',session_id:s})});
} catch(e) {}
</script></body></html>`

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': item.status === 'approved' ? 'public, max-age=300' : 'private, no-store',
      'x-robots-tag': robots,
    },
  })
}
