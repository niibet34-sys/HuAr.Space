import { FormEvent, useEffect, useMemo, useState } from 'react'
import { FOUNDING_CIRCLE } from '../config'
import { getReferralToken, getSessionId, trackEvent } from '../lib/analytics'
import './founding-archive.css'

const FOUNDING_ARCHIVE_DEADLINE = Date.UTC(2030, 0, 1, 0, 0, 0)
const TOTAL_FOUNDING_PLACES = FOUNDING_CIRCLE.total
const RESERVED_FOUNDING_PLACES = FOUNDING_CIRCLE.reserved

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
  closed: boolean
}

function getCountdown(now = Date.now()): Countdown {
  const remaining = Math.max(0, FOUNDING_ARCHIVE_DEADLINE - now)
  const totalSeconds = Math.floor(remaining / 1000)

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    closed: remaining <= 0,
  }
}

function pad(value: number, length = 2) {
  return String(value).padStart(length, '0')
}

export function FoundingArchive() {
  const [countdown, setCountdown] = useState(() => getCountdown())
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestBusy, setRequestBusy] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!requestOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [requestOpen])

  const remainingPlaces = TOTAL_FOUNDING_PLACES - RESERVED_FOUNDING_PLACES
  const places = useMemo(
    () => Array.from({ length: TOTAL_FOUNDING_PLACES }, (_, index) => ({
      place: index + 1,
      reserved: index < RESERVED_FOUNDING_PLACES,
    })),
    [],
  )

  const openRequest = () => {
    setRequestOpen(true)
    setRequestSent(false)
    setRequestError('')
    trackEvent('founding_request_opened', { referral_token: getReferralToken() })
  }

  const closeRequest = () => {
    setRequestOpen(false)
    setRequestError('')
  }

  const submitRequest = async (event: FormEvent) => {
    event.preventDefault()
    setRequestError('')

    if (!name.trim()) {
      setRequestError('Please enter your name.')
      return
    }

    if (!email.trim()) {
      setRequestError('Please enter your email.')
      return
    }

    setRequestBusy(true)

    try {
      const response = await fetch('/api/founder-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          country: country.trim(),
          note: note.trim(),
          source_referral: getReferralToken() || undefined,
          session_id: getSessionId(),
          website: '',
        }),
      })

      const result = await response.json() as { ok?: boolean; error?: string }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not send your request.')
      }

      setRequestSent(true)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Could not send your request.')
    } finally {
      setRequestBusy(false)
    }
  }

  return (
    <>
      <section className="founding-archive" id="founding-archive">
        <div className="founding-archive__glow" aria-hidden="true" />
        <div className="founding-archive__copy">
          <p className="section-kicker">The Founding Archive · 2030</p>
          <h2>There will never be another first archive.</h2>
          <p>
            Every human thought submitted before the Founding Archive closes becomes part of HUAR’s first
            physical time capsule — preserved on Earth and sealed as a record of this moment in humanity.
          </p>
          <p>
            A second copy carried beyond Earth is part of the mission if the technical and financial path
            becomes possible. The physical 2030 capsule on Earth is the first permanent milestone.
          </p>
          <div className="founding-archive__status">
            <i aria-hidden="true" />
            <span>Archive accepting thoughts now</span>
          </div>
        </div>

        <div className="founding-countdown" aria-live="off">
          <p className="founding-countdown__label">
            {countdown.closed ? 'The Founding Archive is closed' : 'Until the first physical capsule is sealed'}
          </p>

          <div className="founding-countdown__grid" aria-label="Countdown to the 2030 Founding Archive">
            <div>
              <strong>{pad(countdown.days, 4)}</strong>
              <span>Days</span>
            </div>
            <div>
              <strong>{pad(countdown.hours)}</strong>
              <span>Hours</span>
            </div>
            <div>
              <strong>{pad(countdown.minutes)}</strong>
              <span>Minutes</span>
            </div>
            <div>
              <strong>{pad(countdown.seconds)}</strong>
              <span>Seconds</span>
            </div>
          </div>

          <p className="founding-countdown__deadline">
            00:00 UTC · 01 JAN 2030
          </p>
          <p className="founding-countdown__note">
            Thoughts submitted after the deadline belong to the 2040 Archive.
          </p>
        </div>
      </section>

      <section className="first-hundred" id="first-100">
        <div className="first-hundred__copy">
          <p className="section-kicker">The First 100 · Founding Circle</p>
          <h2>100 names.<br />Once. Forever.</h2>
          <p className="first-hundred__lead">
            Anyone can become part of the archive. Only 100 people can become part of its origin.
          </p>
          <p>
            The first 100 founding members will help make HUAR’s first physical archive possible. Their names
            will be permanently engraved on the 2030 Founding Capsule as part of the project’s origin record.
          </p>
          <p>
            The Founding Circle does not stay open until 2030. It closes permanently the moment the 100th
            place is confirmed — whether that happens in years, months, or weeks.
          </p>

          <div className="first-hundred__availability">
            <span>{remainingPlaces} founding places remain</span>
            <strong>Founding details are shared privately.</strong>
          </div>

          <div className="first-hundred__actions">
            <button className="founder-access" type="button" onClick={openRequest}>
              Request a Founding Place
            </button>
            <small>
              Requests are reviewed personally by Roman Rothschild. Founding status is commemorative and does not represent equity or ownership.
            </small>
            <a className="founder-email-fallback" href="mailto:founders@huar.space">
              founders@huar.space
            </a>
          </div>
        </div>

        <div className="founder-register" aria-label="The First 100 founding places">
          <div className="founder-register__topline">
            <div>
              <span>Founding places remaining</span>
              <strong>{remainingPlaces}</strong>
            </div>
            <div className="founder-register__claimed">
              <span>Reserved</span>
              <strong>{RESERVED_FOUNDING_PLACES} / {TOTAL_FOUNDING_PLACES}</strong>
            </div>
          </div>

          <div className="founder-register__grid founder-register__grid--etched">
            {places.map(({ place, reserved }) => (
              <span
                key={place}
                className={reserved ? 'is-claimed' : ''}
                aria-label={`Founding place ${pad(place, 3)} · ${reserved ? 'reserved' : 'available'}`}
                title={`Founding place ${pad(place, 3)} · ${reserved ? 'reserved' : 'available'}`}
              />
            ))}
          </div>

          <div className="founder-register__legend">
            <span><i className="is-claimed" aria-hidden="true" /> Reserved</span>
            <span><i className="is-available" aria-hidden="true" /> Available · closes forever after place 100</span>
          </div>

          <div className="founder-register__engraving">
            <span>2030 Founding Capsule</span>
            <strong>THE FIRST 100</strong>
            <small>Names engraved permanently on the first physical HUAR capsule.</small>
          </div>
        </div>
      </section>

      {requestOpen && (
        <div className="founder-request" role="dialog" aria-modal="true" aria-label="Request a Founding Place">
          <button className="founder-request__backdrop" type="button" aria-label="Close" onClick={closeRequest} />

          <div className="founder-request__panel">
            <header className="founder-request__header">
              <span>HUAR · The First 100</span>
              <button type="button" onClick={closeRequest} aria-label="Close">×</button>
            </header>

            {!requestSent ? (
              <div className="founder-request__content">
                <div className="founder-request__intro">
                  <p className="section-kicker">Request one of the First 100 places</p>
                  <h3>Become part of where HUAR begins.</h3>
                  <p>
                    Founding requests are reviewed personally. If there is a fit, Roman will reply directly with the founding details and next steps.
                  </p>
                  <div className="founder-request__scarcity">
                    <strong>{remainingPlaces}</strong>
                    <span>places remain</span>
                  </div>
                </div>

                <form className="founder-request__form" onSubmit={submitRequest}>
                  <label>
                    <span>Your name</span>
                    <input
                      type="text"
                      maxLength={80}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Name"
                      autoFocus
                    />
                  </label>

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      maxLength={200}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    <span>Country</span>
                    <input
                      type="text"
                      maxLength={80}
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <label>
                    <span>Why does HUAR resonate with you?</span>
                    <textarea
                      maxLength={600}
                      rows={4}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Optional"
                    />
                    <small>{note.length} / 600</small>
                  </label>

                  <label className="founder-request__honeypot" aria-hidden="true">
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>

                  <p className="founder-request__privacy">
                    Your information is used only to review and reply to your Founding Circle request.
                  </p>

                  {requestError && <p className="founder-request__error" role="alert">{requestError}</p>}

                  <button className="founder-request__submit" type="submit" disabled={requestBusy}>
                    {requestBusy ? 'Sending request…' : 'Send founding request'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="founder-request__success">
                <div className="founder-request__signal" aria-hidden="true"><i /></div>
                <p className="section-kicker">Request received</p>
                <h3>Your place has not been claimed yet — but the conversation has begun.</h3>
                <p>
                  Roman will review your request personally and reply to <strong>{email}</strong> with the founding details and next steps.
                </p>
                <button type="button" onClick={closeRequest}>Return to HUAR</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
