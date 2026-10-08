import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { FOUNDING_ARCHIVE_EPOCH, FOUNDING_CIRCLE } from '../config'
import { getReferralToken, getSessionId, trackEvent } from '../lib/analytics'
import { renderThoughtCard } from '../lib/thoughtCard'
import type { ThoughtCardFormat } from '../lib/thoughtCard'
import './thought-experience.css'

type Submission = {
  id: string
  share_token: string
  thought: string
  display_name: string
  status: 'pending' | 'approved' | 'rejected'
  epoch: number
  permalink: string
}

type Props = {
  open: boolean
  onClose: () => void
}

const MAX_THOUGHT = 280

export function ThoughtExperience({ open, onClose }: Props) {
  const [thought, setThought] = useState('')
  const [name, setName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [cardFormat, setCardFormat] = useState<ThoughtCardFormat>('portrait')
  const [cardBlob, setCardBlob] = useState<Blob | null>(null)
  const [cardUrl, setCardUrl] = useState('')
  const [cardBusy, setCardBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const startedRef = useRef(false)

  const remainingFounders = FOUNDING_CIRCLE.total - FOUNDING_CIRCLE.reserved
  const charsRemaining = MAX_THOUGHT - thought.length
  const referral = useMemo(() => getReferralToken(), [open])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  useEffect(() => {
    if (!submission) return
    let active = true
    setCardBusy(true)

    void renderThoughtCard({
      thought: submission.thought,
      displayName: submission.display_name,
      epoch: submission.epoch,
      seed: submission.share_token,
      format: cardFormat,
    }).then(({ blob }) => {
      if (!active) return
      setCardBlob(blob)
      const nextUrl = URL.createObjectURL(blob)
      setCardUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return nextUrl
      })
      setCardBusy(false)
      trackEvent('thought_card_generated', {
        thought_id: submission.id,
        referral_token: referral,
        metadata: { format: cardFormat },
      })
    }).catch(() => {
      if (active) setCardBusy(false)
    })

    return () => {
      active = false
    }
  }, [submission, cardFormat, referral])

  useEffect(() => () => {
    if (cardUrl) URL.revokeObjectURL(cardUrl)
  }, [cardUrl])

  if (!open) return null

  const noteStarted = () => {
    if (startedRef.current) return
    startedRef.current = true
    trackEvent('thought_started', { referral_token: referral })
  }

  const resetAndClose = () => {
    if (cardUrl) URL.revokeObjectURL(cardUrl)
    setThought('')
    setName('')
    setAnonymous(false)
    setConsent(false)
    setSubmission(null)
    setCardBlob(null)
    setCardUrl('')
    setCardFormat('portrait')
    setEmail('')
    setEmailState('idle')
    setError('')
    startedRef.current = false
    onClose()
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!thought.trim()) {
      setError('Leave one thought before continuing.')
      return
    }
    if (!anonymous && !name.trim()) {
      setError('Add the name you want shown, or choose Anonymous.')
      return
    }
    if (!consent) {
      setError('Please confirm that HUAR may display your thought and chosen name.')
      return
    }

    setSubmitting(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          thought: thought.trim(),
          display_name: name.trim(),
          anonymous,
          consent_public: consent,
          source_referral: referral || undefined,
          source_channel: params.get('utm_source') || (referral ? 'shared_thought' : 'direct'),
          session_id: getSessionId(),
          website: '',
        }),
      })

      const result = await response.json() as Submission & { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not save your thought.')

      setSubmission(result)
      if (referral) {
        trackEvent('referral_thought_submitted', {
          thought_id: result.id,
          referral_token: referral,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your thought.')
    } finally {
      setSubmitting(false)
    }
  }

  const shareText = submission
    ? 'I left one thought for humanity. What would yours be?\nHUAR.SPACE'
    : ''

  const shareNative = async () => {
    if (!submission) return
    trackEvent('thought_share_clicked', {
      thought_id: submission.id,
      referral_token: referral,
      metadata: { method: 'native' },
    })

    try {
      const file = cardBlob
        ? new File([cardBlob], 'HUAR-thought.png', { type: 'image/png' })
        : null

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My thought for humanity · HUAR',
          text: shareText,
          url: submission.permalink,
          files: [file],
        })
      } else if (navigator.share) {
        await navigator.share({
          title: 'My thought for humanity · HUAR',
          text: shareText,
          url: submission.permalink,
        })
      } else {
        await copyLink()
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }

  const downloadCard = () => {
    if (!submission || !cardBlob) return
    const url = URL.createObjectURL(cardBlob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'HUAR-' + submission.share_token + '-' + cardFormat + '.png'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    trackEvent('thought_downloaded', {
      thought_id: submission.id,
      referral_token: referral,
      metadata: { format: cardFormat },
    })
  }

  const copyLink = async () => {
    if (!submission) return
    await navigator.clipboard.writeText(submission.permalink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
    trackEvent('thought_link_copied', { thought_id: submission.id, referral_token: referral })
  }

  const socialShare = (network: 'x' | 'facebook' | 'whatsapp' | 'linkedin') => {
    if (!submission) return
    const url = encodeURIComponent(submission.permalink)
    const text = encodeURIComponent(shareText)
    const targets = {
      x: 'https://twitter.com/intent/tweet?text=' + text + '&url=' + url,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
      whatsapp: 'https://wa.me/?text=' + text + '%20' + url,
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
    }
    window.open(targets[network], '_blank', 'noopener,noreferrer')
    trackEvent('thought_share_clicked', {
      thought_id: submission.id,
      referral_token: referral,
      metadata: { method: network },
    })
  }

  const inviteNext = async () => {
    if (!submission) return
    const text = 'I left one thought for humanity. Now I want to know yours.'
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Leave one thought for humanity', text, url: submission.permalink })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    await copyLink()
  }

  const goToFounders = () => {
    if (referral) {
      trackEvent('referral_first100_clicked', {
        thought_id: submission?.id,
        referral_token: referral,
      })
    }
    resetAndClose()
    window.setTimeout(() => document.getElementById('first-100')?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  const saveEmail = async (event: FormEvent) => {
    event.preventDefault()
    if (!submission || !email.trim()) return
    setEmailState('saving')
    try {
      const response = await fetch('/api/thoughts/' + submission.share_token, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!response.ok) throw new Error()
      setEmailState('saved')
      trackEvent('thought_email_added', { thought_id: submission.id, referral_token: referral })
    } catch {
      setEmailState('error')
    }
  }

  return (
    <div className="thought-experience" role="dialog" aria-modal="true" aria-label="Leave your thought">
      <button className="thought-experience__backdrop" type="button" aria-label="Close" onClick={resetAndClose} />

      <div className="thought-experience__panel">
        <header className="thought-experience__header">
          <a href="/" className="thought-experience__brand">HUAR</a>
          <span>{submission ? 'Thought recorded' : 'The 2030 Founding Archive'}</span>
          <button type="button" onClick={resetAndClose} aria-label="Close">×</button>
        </header>

        {!submission ? (
          <div className="thought-compose">
            <div className="thought-compose__intro">
              <p className="thought-overline">One thought. For those who come after us.</p>
              <h2>Imagine someone reading this 100 years from now.</h2>
              <p>What is the one thought you would want them to find?</p>
            </div>

            <form className="thought-form" onSubmit={submit}>
              <label className="thought-field thought-field--large">
                <span>Your thought</span>
                <textarea
                  value={thought}
                  maxLength={MAX_THOUGHT}
                  rows={6}
                  placeholder="What should humanity remember?"
                  onFocus={noteStarted}
                  onChange={(event) => {
                    noteStarted()
                    setThought(event.target.value)
                  }}
                  autoFocus
                />
                <small className={charsRemaining < 30 ? 'is-near-limit' : ''}>{thought.length} / {MAX_THOUGHT}</small>
              </label>

              <div className="thought-name-row">
                <label className="thought-field">
                  <span>Your name</span>
                  <input
                    value={name}
                    maxLength={60}
                    disabled={anonymous}
                    placeholder="Name or pseudonym"
                    onFocus={noteStarted}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>

                <label className="thought-anonymous">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(event) => setAnonymous(event.target.checked)}
                  />
                  <span>Publish as Anonymous</span>
                </label>
              </div>

              <label className="thought-honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>

              <label className="thought-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>I agree that my thought and chosen display name may be displayed publicly by HUAR.</span>
              </label>

              <p className="thought-founder-distinction">
                Submitting a thought lets you take part in the HUAR conversation. The First 100 are a separate founding circle.
              </p>

              {error && <p className="thought-error" role="alert">{error}</p>}

              <button className="thought-submit" type="submit" disabled={submitting}>
                {submitting ? 'Sending into the archive…' : 'Leave your thought'}
                <i aria-hidden="true">↗</i>
              </button>
            </form>
          </div>
        ) : (
          <div className="thought-success">
            <div className="thought-success__intro">
              <p className="thought-overline">Your thought has entered HUAR.</p>
              <h2>Now let it travel.</h2>
              <p>Your card is ready to share. Public inclusion in the HUAR cosmos is reviewed before publication.</p>
            </div>

            <div className="thought-artifact">
              <div className="thought-artifact__toolbar">
                <span>Your HUAR artifact</span>
                <div>
                  <button className={cardFormat === 'portrait' ? 'is-active' : ''} type="button" onClick={() => setCardFormat('portrait')}>Feed</button>
                  <button className={cardFormat === 'story' ? 'is-active' : ''} type="button" onClick={() => setCardFormat('story')}>Story</button>
                </div>
              </div>

              <div className={'thought-card-preview thought-card-preview--' + cardFormat}>
                {cardBusy && <span className="thought-card-preview__loading">Rendering artifact…</span>}
                {cardUrl && <img src={cardUrl} alt={'HUAR card: ' + submission.thought} />}
              </div>
            </div>

            <div className="thought-share">
              <button className="thought-share__primary" type="button" onClick={shareNative} disabled={cardBusy}>
                Share your thought <span aria-hidden="true">↗</span>
              </button>

              <div className="thought-share__actions">
                <button type="button" onClick={downloadCard} disabled={!cardBlob}>Download image</button>
                <button type="button" onClick={copyLink}>{copied ? 'Link copied' : 'Copy link'}</button>
                <button type="button" onClick={() => socialShare('x')}>X</button>
                <button type="button" onClick={() => socialShare('facebook')}>Facebook</button>
                <button type="button" onClick={() => socialShare('whatsapp')}>WhatsApp</button>
                <button type="button" onClick={() => socialShare('linkedin')}>LinkedIn</button>
              </div>
              <p className="thought-share__instagram">For Instagram, use Share on mobile or download the image and post it from the app.</p>
            </div>

            <section className="thought-next">
              <p className="thought-overline">Now ask someone else.</p>
              <h3>Who should leave the next thought for humanity?</h3>
              <button type="button" onClick={inviteNext}>Invite someone</button>
            </section>

            <section className="thought-founders">
              <div>
                <p className="thought-overline">Want to be part of where HUAR begins?</p>
                <h3>{remainingFounders} of the First {FOUNDING_CIRCLE.total} places remain.</h3>
              </div>
              <button type="button" onClick={goToFounders}>Explore the First 100</button>
            </section>

            <form className="thought-follow" onSubmit={saveEmail}>
              <div>
                <span>Follow the Human Archive</span>
                <p>Want to know when HUAR reaches its next milestone? Email is optional and never public.</p>
              </div>
              {emailState === 'saved' ? (
                <strong>You're on the archive list.</strong>
              ) : (
                <div className="thought-follow__field">
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email" />
                  <button type="submit" disabled={emailState === 'saving'}>{emailState === 'saving' ? 'Saving…' : 'Keep me informed'}</button>
                </div>
              )}
              {emailState === 'error' && <small>Please check the email and try again.</small>}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
