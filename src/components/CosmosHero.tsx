import { useEffect, useRef, useState } from 'react'
import { archiveQuotes } from '../data/quotes'
import type { UniverseEngine } from '../lib/UniverseEngine'
import './cosmos-refinement.css'

const ambientQuotes = archiveQuotes.filter((quote) =>
  ['q01', 'q03', 'q04', 'q05', 'q07', 'q08', 'q10', 'q12', 'q13', 'q15'].includes(quote.id),
)

const featuredQuotes = archiveQuotes.filter((quote) =>
  ['q02', 'q06', 'q11', 'q14', 'q18', 'q24'].includes(quote.id),
)

const QUOTE_CYCLE_MS = 9200

export function CosmosHero() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const engineRef = useRef<UniverseEngine | null>(null)
  const quoteRefs = useRef(new Map<string, HTMLButtonElement>())
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [featuredPaused, setFeaturedPaused] = useState(false)

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
  }, [])

  useEffect(() => {
    if (focusedId || featuredPaused || featuredQuotes.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const interval = window.setInterval(() => {
      setFeaturedIndex((index) => (index + 1) % featuredQuotes.length)
    }, QUOTE_CYCLE_MS)

    return () => window.clearInterval(interval)
  }, [featuredPaused, focusedId])

  const setQuoteRef = (id: string) => (node: HTMLButtonElement | null) => {
    if (node) quoteRefs.current.set(id, node)
    else quoteRefs.current.delete(id)
    engineRef.current?.registerQuote(id, node)
  }

  const focusQuote = (id: string | null) => {
    setFocusedId(id)
    engineRef.current?.focusQuote(id)
  }

  const focusedQuote = archiveQuotes.find((quote) => quote.id === focusedId)
  const featuredQuote = featuredQuotes[featuredIndex % featuredQuotes.length]
  const drift = featuredIndex % 3

  return (
    <section className="cosmos-hero" aria-label="Human Archive Space">
      <div ref={stageRef} className="universe-stage">
        <div className="cosmos-vignette" aria-hidden="true" />
        <div className="cosmos-grain" aria-hidden="true" />

        <div className="quote-layer" aria-label="Distant thoughts in the human archive">
          {ambientQuotes.map((quote) => (
            <button
              key={quote.id}
              ref={setQuoteRef(quote.id)}
              type="button"
              className="space-quote"
              aria-label={`${quote.text} — ${quote.place}, ${quote.year}`}
              onClick={(event) => {
                event.stopPropagation()
                focusQuote(focusedId === quote.id ? null : quote.id)
              }}
            >
              <span className="space-quote__text">“{quote.text}”</span>
              <span className="space-quote__meta">{quote.place} · {quote.year}</span>
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

        {featuredQuote && !focusedQuote && (
          <div
            className={`featured-thought-wrap featured-thought-wrap--${drift}`}
            role="status"
            aria-live="polite"
          >
            <button
              key={featuredQuote.id}
              type="button"
              className={`featured-thought ${featuredPaused ? 'is-paused' : ''}`}
              aria-label={`${featuredQuote.text}. ${featuredQuote.place}, ${featuredQuote.year}. ${featuredPaused ? 'Resume' : 'Hold'} this thought.`}
              onClick={() => setFeaturedPaused((paused) => !paused)}
            >
              <span className="featured-thought__signal" aria-hidden="true">
                <i />
                Voice from the archive
              </span>
              <span className="featured-thought__text">“{featuredQuote.text}”</span>
              <span className="featured-thought__meta">{featuredQuote.place} · {featuredQuote.year}</span>
            </button>
          </div>
        )}

        <div className={`focus-readout ${focusedQuote ? 'is-visible' : ''}`} aria-live="polite">
          {focusedQuote && (
            <>
              <p>{focusedQuote.author}</p>
              <span>{focusedQuote.place} · {focusedQuote.year}</span>
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
