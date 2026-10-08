import { useEffect, useRef, useState } from 'react'
import { historicalQuotes } from '../data/quotes'
import type { ArchiveQuote } from '../data/quotes'
import type { UniverseEngine } from '../lib/UniverseEngine'
import './cosmos-refinement.css'

const QUOTE_CYCLE_MS = 9200
const INTRO_QUOTE_DELAY_MS = 850
const INTRO_SCROLL_LOCK_MS = 2400
const AMBIENT_QUOTE_COUNT = 10

function randomIndex(length: number, except = -1) {
  if (length <= 1) return 0

  let next = except
  while (next === except) {
    next = Math.floor(Math.random() * length)
  }
  return next
}

function sampleQuotes(quotes: ArchiveQuote[], count: number, excludeId?: string) {
  return quotes
    .filter((quote) => quote.id !== excludeId)
    .map((quote) => ({ quote, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, count)
    .map(({ quote }) => quote)
}

export function CosmosHero() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const engineRef = useRef<UniverseEngine | null>(null)
  const quoteRefs = useRef(new Map<string, HTMLButtonElement>())

  const [featuredIndex, setFeaturedIndex] = useState(() => randomIndex(historicalQuotes.length))
  const [ambientQuotes] = useState(() =>
    sampleQuotes(historicalQuotes, AMBIENT_QUOTE_COUNT),
  )
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [featuredPaused, setFeaturedPaused] = useState(false)
  const [introReady, setIntroReady] = useState(false)

  useEffect(() => {
    if (!stageRef.current) return

    let disposed = false
    let engine: UniverseEngine | null = null
    const stage = stageRef.current

    void import('../lib/UniverseEngine').then(({ UniverseEngine }) => {
      if (disposed) return
      engine = new UniverseEngine(stage, ambientQuotes.map((quote) => quote.id))
      engineRef.current = engine
      quoteRefs.current.forEach((node, id) => engine?.registerQuote(id, node))
    })

    return () => {
      disposed = true
      engine?.destroy()
      if (engineRef.current === engine) engineRef.current = null
    }
  }, [ambientQuotes])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTopEntry = !window.location.hash || window.location.hash === '#top'

    if (reducedMotion) {
      setIntroReady(true)
      return
    }

    if (isTopEntry) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.classList.add('huar-intro-lock')
    }

    const quoteTimer = window.setTimeout(() => {
      setIntroReady(true)
    }, INTRO_QUOTE_DELAY_MS)

    const unlockTimer = window.setTimeout(() => {
      document.documentElement.classList.remove('huar-intro-lock')
    }, INTRO_SCROLL_LOCK_MS)

    return () => {
      window.clearTimeout(quoteTimer)
      window.clearTimeout(unlockTimer)
      document.documentElement.classList.remove('huar-intro-lock')
    }
  }, [])

  useEffect(() => {
    if (!introReady || focusedId || featuredPaused || historicalQuotes.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const interval = window.setInterval(() => {
      setFeaturedIndex((index) => randomIndex(historicalQuotes.length, index))
    }, QUOTE_CYCLE_MS)

    return () => window.clearInterval(interval)
  }, [featuredPaused, focusedId, introReady])

  const setQuoteRef = (id: string) => (node: HTMLButtonElement | null) => {
    if (node) quoteRefs.current.set(id, node)
    else quoteRefs.current.delete(id)
    engineRef.current?.registerQuote(id, node)
  }

  const focusQuote = (id: string | null) => {
    setFocusedId(id)
    engineRef.current?.focusQuote(id)
  }

  const focusedQuote = historicalQuotes.find((quote) => quote.id === focusedId)
  const featuredQuote = historicalQuotes[featuredIndex % historicalQuotes.length]
  const drift = featuredIndex % 3

  return (
    <section className="cosmos-hero" aria-label="Human Archive Space">
      <div ref={stageRef} className="universe-stage">
        <div className="cosmos-vignette" aria-hidden="true" />
        <div className="cosmos-grain" aria-hidden="true" />

        <div className="quote-layer" aria-label="Distant voices across human history">
          {ambientQuotes.map((quote) => (
            <button
              key={quote.id}
              ref={setQuoteRef(quote.id)}
              type="button"
              className="space-quote"
              aria-label={`${quote.text} — ${quote.meta}`}
              onClick={(event) => {
                event.stopPropagation()
                focusQuote(focusedId === quote.id ? null : quote.id)
              }}
            >
              <span className="space-quote__text">“{quote.text}”</span>
              <span className="space-quote__meta">{quote.meta}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="universe-dismiss"
          aria-label="Close focused thought"
          tabIndex={focusedId ? 0 : -1}
          onClick={() => focusQuote(null)}
        />

        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="HUAR home">HUAR</a>
          <div className="header-actions">
            <a href="#archive">Archive</a>
            <a href="#first-100">First 100</a>
            <a href="#mission">Mission</a>
            <a className="header-cta" href="#leave-a-thought">Leave your thought</a>
          </div>
        </header>

        <div className="hero-context" id="top">
          <p className="eyebrow">Human Archive Space</p>
          <p className="hero-context__rule">One defining thought.<br />For each archive decade.</p>
          <p className="hero-context__copy">
            The first archive is sealed in 2030. Then 2040, 2050 and beyond — a shared timeline of human change.
          </p>
        </div>

        {introReady && featuredQuote && !focusedQuote && (
          <div
            className={`featured-thought-wrap featured-thought-wrap--${drift}`}
            role="status"
            aria-live="polite"
          >
            <button
              key={featuredQuote.id}
              type="button"
              className={`featured-thought ${featuredPaused ? 'is-paused' : ''}`}
              aria-label={`${featuredQuote.text}. ${featuredQuote.meta}. ${featuredPaused ? 'Resume' : 'Hold'} this thought.`}
              onClick={() => setFeaturedPaused((paused) => !paused)}
            >
              <span className="featured-thought__signal" aria-hidden="true">
                <i />
                Voice across time
              </span>
              <span className="featured-thought__text">“{featuredQuote.text}”</span>
              <span className="featured-thought__meta">{featuredQuote.meta}</span>
            </button>
          </div>
        )}

        <div className={`focus-readout ${focusedQuote ? 'is-visible' : ''}`} aria-live="polite">
          {focusedQuote && (
            <>
              <p>{focusedQuote.author}</p>
              <span>{focusedQuote.source}</span>
              <button type="button" onClick={() => focusQuote(null)}>Return to the universe</button>
            </>
          )}
        </div>

        <div className="hero-ethos" aria-hidden="true">
          <span>One thought. One human life.</span>
        </div>

        <a className="scroll-cue" href="#archive" aria-label="Explore the archive">
          <span>Explore the archive</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
