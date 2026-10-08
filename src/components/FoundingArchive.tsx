import { useEffect, useMemo, useState } from 'react'
import { FOUNDING_CIRCLE } from '../config'
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

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const remainingPlaces = TOTAL_FOUNDING_PLACES - RESERVED_FOUNDING_PLACES
  const places = useMemo(
    () => Array.from({ length: TOTAL_FOUNDING_PLACES }, (_, index) => ({
      place: index + 1,
      reserved: index < RESERVED_FOUNDING_PLACES,
    })),
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
            <strong>${FOUNDING_CIRCLE.contributionUsd.toLocaleString()}</strong>
          </div>

          <div className="first-hundred__actions">
            <a
              className="founder-access"
              href="mailto:founders@huar.space?subject=HUAR%20Founding%20Circle%20%E2%80%94%20Place%20Request&body=Hello%20Roman%2C%0A%0AI%27m%20interested%20in%20reserving%20one%20of%20the%20First%20100%20Founding%20Places%20in%20HUAR.%0A%0AName%3A%0ACountry%3A%0A%0ABest%2C"
            >
              Request a Founding Place
            </a>
            <small>
              Applications are reviewed personally by the founder. Founding status is commemorative and does not represent equity or ownership.
            </small>
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
    </>
  )
}
