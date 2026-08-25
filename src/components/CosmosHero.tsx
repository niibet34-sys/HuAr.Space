import { useEffect, useRef, useState } from 'react'
import { archiveQuotes } from '../data/quotes'
import { UniverseEngine } from '../lib/UniverseEngine'

export function CosmosHero() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const engineRef = useRef<UniverseEngine | null>(null)
  const quoteRefs = useRef(new Map<string, HTMLButtonElement>())
  const [focusedId, setFocusedId] = useState<string | null>(null)

  useEffect(() => {
    if (!stageRef.current) return
    const engine = new UniverseEngine(stageRef.current, archiveQuotes.map((quote) => quote.id))
    engineRef.current = engine
    quoteRefs.current.forEach((node, id) => engine.registerQuote(id, node))

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [])

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

  return (
    <section className="cosmos-hero" aria-label="Human Archive Space">
      <div ref={stageRef} className="universe-stage">
        <div className="cosmos-vignette" aria-hidden="true" />
        <div className="cosmos-grain" aria-hidden="true" />

        <div className="quote-layer" aria-label="Thoughts in the human archive">
          {archiveQuotes.map((quote) => (
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
            <a href="#mission">Mission</a>
            <a className="header-cta" href="#leave-a-thought">Leave your thought</a>
          </div>
        </header>

        <div className="hero-intro" id="top">
          <p className="eyebrow">Human Archive Space</p>
          <h1>One thought.<br />One human life.</h1>
          <p className="hero-intro__copy">
            A living archive of what humanity thought, feared, loved and hoped for — preserved across generations.
          </p>
        </div>

        <div className={`focus-readout ${focusedQuote ? 'is-visible' : ''}`} aria-live="polite">
          {focusedQuote && (
            <>
              <p>{focusedQuote.author}</p>
              <span>{focusedQuote.place} · {focusedQuote.year}</span>
              <button type="button" onClick={() => focusQuote(null)}>Return to the universe</button>
            </>
          )}
        </div>

        <a className="scroll-cue" href="#archive" aria-label="Explore the archive">
          <span>Explore the archive</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
