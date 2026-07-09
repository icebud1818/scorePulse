import { Link } from 'react-router-dom'
import { FlagIcon, PulseIcon, TargetIcon, TrophyIcon } from '../components/Icons.jsx'

// Public marketing / landing page shown at "/" to logged-out visitors.
// Logged-in users get the Dashboard instead (see App.jsx routing).
export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Golf tracking, minus the clutter</span>
          <h1>
            Know your game.<br />
            Watch your <span className="gradient-text">score pulse</span>.
          </h1>
          <p className="lead">
            Log every round, track a running handicap, and see exactly where
            you're gaining strokes — all in one clean, fast tracker built for
            golfers who actually play.
          </p>
          <div className="hero-cta">
            <Link to="/signup"><button className="primary btn-lg">Get started — it's free</button></Link>
            <Link to="/login"><button className="btn-lg">Log in</button></Link>
          </div>
          <p className="hero-note muted">No credit card. Your data stays yours.</p>
        </div>

        <div className="hero-preview" aria-hidden="true">
          <div className="preview-card">
            <div className="preview-head">
              <span className="muted">Handicap</span>
              <span className="tag preview-trend">▾ improving</span>
            </div>
            <div className="preview-hcp">8.4</div>
            <div className="preview-chart">
              {[62, 48, 55, 40, 44, 30, 36, 22].map((h, i) => (
                <span key={i} className="bar" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="preview-stats">
              <div>
                <div className="preview-stat-val">79</div>
                <div className="muted">Best 18</div>
              </div>
              <div>
                <div className="preview-stat-val">42</div>
                <div className="muted">Rounds</div>
              </div>
              <div>
                <div className="preview-stat-val">51%</div>
                <div className="muted">GIR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features container">
        <div className="grid cols-2">
          {FEATURES.map((f) => (
            <div className="feature card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc muted">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta container">
        <div className="card center cta-card">
          <h2 style={{ marginTop: 0 }}>Ready to find your baseline?</h2>
          <p className="muted" style={{ maxWidth: '48ch', margin: '0 auto 20px' }}>
            Log your first round in under a minute and let scorePulse do the math.
          </p>
          <Link to="/signup"><button className="primary btn-lg">Create your free account</button></Link>
        </div>
      </section>

      <footer className="home-footer">
        <span className="brand">score<span className="pulse">Pulse</span></span>
        <span className="muted">Personal golf tracking · built for the range and the course.</span>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    icon: <FlagIcon size={24} />,
    title: 'Log rounds in seconds',
    desc: 'Per-hole scores plus optional putts, greens in regulation, and out-of-bounds. Preset courses or a custom one — nine or eighteen.',
  },
  {
    icon: <PulseIcon size={24} />,
    title: 'A handicap that keeps up',
    desc: 'Every round feeds a running differential so you always know your number. Scrambles and partial rounds are kept out automatically.',
  },
  {
    icon: <TargetIcon size={24} />,
    title: 'Best score per hole',
    desc: 'See your ideal round on each course — the lowest you\'ve ever carded on every hole, stacked up against par.',
  },
  {
    icon: <TrophyIcon size={24} />,
    title: 'Achievements as you climb',
    desc: 'Break 100, break 90, card your first birdie — milestones unlock as your game grows.',
  },
]

