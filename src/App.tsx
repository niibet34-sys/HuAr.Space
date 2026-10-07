import { CosmosHero } from './components/CosmosHero'

function App() {
  return (
    <main className="site-shell">
      <CosmosHero />

      <section className="archive-section" id="archive">
        <div className="section-kicker">The archive</div>
        <div className="archive-grid">
          <div>
            <h2>A human life, remembered across decades.</h2>
          </div>
          <div className="section-copy">
            <p>
              HUAR asks each person for one defining thought once every ten years. Not a feed. Not a daily diary. A deliberate snapshot of what mattered most at that moment in a life.
            </p>
            <p>
              As the same people return across decades, the archive can reveal something rare: how priorities, fears, hopes and values change within a person — and across entire generations.
            </p>
          </div>
        </div>

        <div className="archive-axis" aria-label="Archive timeline concept">
          <div className="archive-axis__line" />
          <div className="archive-axis__era is-now">
            <span>2026</span>
            <strong>First thought</strong>
          </div>
          <div className="archive-axis__era">
            <span>2036</span>
            <strong>Second thought</strong>
          </div>
          <div className="archive-axis__era">
            <span>2046</span>
            <strong>A life in motion</strong>
          </div>
          <div className="archive-axis__era">
            <span>2056+</span>
            <strong>Generational memory</strong>
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
          <h3>One defining thought.<br />Every ten years.</h3>
          <p>Scarcity turns a post into a marker in a human life — something worth choosing carefully.</p>
        </article>
        <article>
          <span>02</span>
          <h3>A life becomes<br />a timeline.</h3>
          <p>Returning decades later lets the archive show how the same person — and humanity around them — changed.</p>
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
        <h2>How does a human life change<br />when the world changes around it?</h2>
        <p>
          As HUAR grows, the archive can be explored by decade, geography, age and human theme — revealing how love, security, freedom, ambition, family, fear and hope move through history.
        </p>
        <div className="future-tags" aria-label="Future archive dimensions">
          <span>Decades</span>
          <span>Countries</span>
          <span>Ages</span>
          <span>Human priorities</span>
        </div>
      </section>

      <section className="leave-section" id="leave-a-thought">
        <p className="eyebrow">Your place in the archive</p>
        <h2>If humanity could remember one thought from you today, what would it be?</h2>
        <p className="leave-section__note">Your next defining thought opens ten years later.</p>
        <a className="return-to-space" href="#top">Return to the cosmos <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="site-footer">
        <span>HUAR · Human Archive Space</span>
        <span>A memory of humanity, built one decade at a time.</span>
      </footer>
    </main>
  )
}

export default App
