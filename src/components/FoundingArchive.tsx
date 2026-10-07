import { useEffect, useMemo, useState } from 'react'
import './founding-archive.css'

const FOUNDING_ARCHIVE_DEADLINE = Date.UTC(2030, 0, 1, 0, 0, 0)
const TOTAL_FOUNDING_PLACES = 100
const CLAIMED_FOUNDING_PLACES = 0

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
  const remainingPlaces = TOTAL_FOUNDING_PLACES - CLAIMED_FOUNDING_PLACES

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const places = useMemo(
    () => Array.from({ length: TOTAL_FOUNDING_PLACES }, (_, index) => index < CLAIMED_FOUNDING_PLACES),
    [],
  )

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
            place is claimed — whether that happens in years, months, or weeks.
          </p>

          <div className="first-hundred__terms">
            <span>Founding contribution</span>
            <strong>$1,000</strong>
          </div>

          <div className="first-hundred__actions">
            <span className="founder-access founder-access--pending" aria-disabled="true">
              Founding access opening soon
            </span>
            <small>Founding status is commemorative and does not represent equity or ownership.</small>
          </div>
        </div>

        <div className="founder-register" aria-label="The First 100 founding places">
          <div className="founder-register__topline">
            <div>
              <span>Founding places remaining</span>
              <strong>{remainingPlaces}</strong>
            </div>
            <div className="founder-register__claimed">
              <span>Confirmed</span>
              <strong>{CLAIMED_FOUNDING_PLACES} / {TOTAL_FOUNDING_PLACES}</strong>
            </div>
          </div>

          <div className="founder-register__grid">
            {places.map((claimed, index) => (
              <span
                key={index}
                className={claimed ? 'is-claimed' : ''}
                aria-label={`Founding place ${pad(index + 1, 3)} ${claimed ? 'claimed' : 'available'}`}
                title={`Founding place ${pad(index + 1, 3)} · ${claimed ? 'claimed' : 'available'}`}
              />
            ))}
          </div>

          <div className="founder-register__legend">
            <span><i className="is-available" aria-hidden="true" /> Available</span>
            <span><i className="is-claimed" aria-hidden="true" /> Claimed</span>
          </div>

          <div className="founder-register__engraving">
            <span>2030 Founding Capsule</span>
            <strong>THE FIRST 100</strong>
            <small>Names engraved permanently on the first physical HUAR capsule.</small>
          </div>
        </div>
      </section>
    </>
  )
}
