import { CosmosHero } from './components/CosmosHero'
import { FoundingArchive } from './components/FoundingArchive'

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
              HUAR collects one defining thought from each person for each archive decade. Not a feed. Not a daily diary. A deliberate snapshot of what mattered most at that moment in a life.
            </p>
            <p>
              Each cycle is sealed on the same global timeline — 2030, 2040, 2050 and beyond — so the archive can reveal how priorities, fears, hopes and values change within a person and across entire generations.
            </p>
          </div>
        </div>

        <div className="archive-axis" aria-label="Archive timeline concept">
          <div className="archive-axis__line" />
          <div className="archive-axis__era is-now">
            <span>2030</span>
            <strong>Founding Archive sealed</strong>
          </div>
          <div className="archive-axis__era">
            <span>2040</span>
            <strong>Second Archive</strong>
          </div>
          <div className="archive-axis__era">
            <span>2050</span>
            <strong>Third Archive</strong>
          </div>
          <div className="archive-axis__era">
            <span>2060+</span>
            <strong>Generational record</strong>
          </div>
        </div>
      </section>

      <FoundingArchive />

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
            Digital archives disappear when companies disappear. HUAR is conceived as a durable cultural object: each decade preserved digitally, sealed into a physical time capsule on Earth, and — if the mission becomes possible — ultimately carried beyond Earth as a record of human thought.
          </p>
          <p>
            The first capsule will be sealed in 2030. The names of HUAR’s first 100 founders will be permanently engraved on that founding capsule as part of the project’s origin record.
          </p>
          <p className="mission-origin">
            HUAR was conceived and created by <strong>Roman Rothschild</strong>.
          </p>
        </div>
      </section>

      <section className="principles-section">
        <article>
          <span>01</span>
          <h3>One defining thought.<br />For each decade.</h3>
          <p>Each archive cycle belongs to the same historical moment for everyone: 2030, 2040, 2050 and beyond.</p>
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

      <section className="partnership-section" id="partners">
        <div className="partnership-section__eyebrow">Strategic partners · institutions · space</div>
        <div className="partnership-section__grid">
          <div>
            <h2>Help build the first permanent archive of human thought.</h2>
          </div>
          <div className="partnership-section__copy">
            <p>
              HUAR is open to conversations with space companies, cultural institutions, foundations, sovereign funds, strategic investors and long-term partners who can help make the 2030 Founding Archive real.
            </p>
            <p>
              Support at this level is not just funding. The institutions and partners who make the first physical capsule — and a future space mission — possible can become part of HUAR’s permanent origin record.
            </p>
            <div className="partnership-section__statement">
              <span>Become part of the origin.</span>
              <strong>Help write the first chapter into history.</strong>
            </div>
            <div className="partnership-section__contact">
              <span>Partnership & investment inquiries</span>
              <strong>Email contact opening shortly at huar.space</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="leave-section" id="leave-a-thought">
        <p className="eyebrow">Your place in the archive</p>
        <h2>If humanity could remember one thought from you today, what would it be?</h2>
        <p className="leave-section__note">Your thought becomes part of the 2030 Founding Archive. The next archive is sealed in 2040.</p>
        <a className="return-to-space" href="#top">Return to the cosmos <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="site-footer">
        <span>HUAR · Human Archive Space</span>
        <span>Conceived and created by Roman Rothschild.</span>
        <span>A memory of humanity, built one decade at a time.</span>
      </footer>
    </main>
  )
}

export default App
