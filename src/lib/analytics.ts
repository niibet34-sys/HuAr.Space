export type HuarEvent =
  | 'leave_thought_cta_clicked'
  | 'thought_started'
  | 'thought_submitted'
  | 'thought_card_generated'
  | 'thought_share_clicked'
  | 'thought_downloaded'
  | 'thought_link_copied'
  | 'referral_visitor_arrived'
  | 'referral_thought_submitted'
  | 'referral_first100_clicked'
  | 'thought_email_added'

export function getSessionId() {
  const key = 'huar_session'
  let id = window.localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    window.localStorage.setItem(key, id)
  }
  return id
}

export function getReferralToken() {
  return new URLSearchParams(window.location.search).get('ref') || ''
}

export function trackEvent(
  event: HuarEvent,
  data: { thought_id?: string; referral_token?: string; metadata?: Record<string, unknown> } = {},
) {
  void fetch('/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      event,
      thought_id: data.thought_id,
      referral_token: data.referral_token || getReferralToken() || undefined,
      session_id: getSessionId(),
      metadata: data.metadata || {},
    }),
    keepalive: true,
  }).catch(() => undefined)
}

export function trackReferralArrival() {
  const ref = getReferralToken()
  if (!ref) return
  const key = 'huar_ref_seen_' + ref
  if (window.sessionStorage.getItem(key)) return
  window.sessionStorage.setItem(key, '1')
  trackEvent('referral_visitor_arrived', { referral_token: ref, metadata: { landing: 'homepage' } })
}
