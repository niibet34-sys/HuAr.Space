import { CosmosHero } from './components/CosmosHero'

function App() {
  return (
    <main className="site-shell">
      <CosmosHero />

      <section className="archive-section" id="archive">
        <div className="section-kicker">The archive</div>
        <div className="archive-grid">
          <div>
            <h2>Humanity, remembered in first person.</h2>
          </div>
          <div className="section-copy">
            <p>
              HUAR is designed around a simple constraint: one person, one thought. Not a profile. Not a feed. A single fragment of a human life, kept in the context of its place and time.
            </p>
            <p>
              Decades from now, the archive becomes something no social network can be — a longitudinal record of how ordinary people understood their world.
            </p>
          </div>
        </div>

        <div className="archive-axis" aria-label="Archive timeline concept">
          <div className="archive-axis__line" />
          <div className="archive-axis__era is-now">
            <span>2026</span>
            <strong>First voices</strong>
          </div>
          <div className="archive-axis__era">
            <span>2036</span>
            <strong>Second decade</strong>
          </div>
          <div className="archive-axis__era">
            <span>2056</span>
            <strong>Generational memory</strong>
          </div>
          <div className="archive-axis__era">
            <span>2100+</span>
            <strong>Human record</strong>
          </div>
        </div>
      </section>

      <section className="mission-section" id="mission">
        <div className="mission-orbit" aria-hidden="true">
          <span className="mission-orbit__core">HUAR</span>
          <span className="mission-orbit__ring mission-orbit__ring--one" />
          <span className="mission-orbit__ring mission-orbit__ring--two" />
          <span className="mission-orbit__dot mission-orbit__dot--one" />
          <span className="mission-orbit__dot mission-orbit__dot--two" />
        </div>

        <div className="mission-copy">
          <div className="section-kicker">The mission</div>
          <h2>Build a memory larger than any one generation.</h2>
          <p>
            Digital archives disappear when companies disappear. HUAR is conceived as a durable cultural object: replicated, studied across decades and ultimately carried beyond Earth as a physical record of human thought.
          </p>
        </div>
      </section>

      <section className="principles-section">
        <article>
          <span>01</span>
          <h3>One person.<br />One thought.</h3>
          <p>Scarcity forces meaning. HUAR is not another endless stream of content.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Time is part<br />of the record.</h3>
          <p>A thought can be revisited after years, revealing how people and generations change.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Made to<br />outlive us.</h3>
          <p>The archive is designed for durable digital preservation and future physical copies beyond Earth.</p>
        </article>
      </section>

      <section className="future-section">
        <div className="future-glow" aria-hidden="true" />
        <div className="section-kicker">Across time and place</div>
        <h2>What did humanity believe<br />before everything changed?</h2>
        <p>
          As the archive grows, future generations will be able to explore voices by decade and geography — and study how hopes, fears and values move through history.
        </p>
        <div className="future-tags" aria-label="Future archive dimensions">
          <span>Decades</span>
          <span>Countries</span>
          <span>Generations</span>
          <span>Human themes</span>
        </div>
      </section>

      <section className="leave-section" id="leave-a-thought">
        <p className="eyebrow">Your place in the archive</p>
        <h2>If humanity could remember one thought from you, what would it be?</h2>
        <p className="leave-section__note">The first public submission portal is being prepared.</p>
        <a className="return-to-space" href="#top">Return to the cosmos <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="site-footer">
        <span>HUAR · Human Archive Space</span>
        <span>A memory of humanity, built one voice at a time.</span>
      </footer>
    </main>
  )
}

export default App
