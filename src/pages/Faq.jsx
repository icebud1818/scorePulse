import { Link } from 'react-router-dom'

// Public FAQ — static content, safe to render logged-out (no data hooks).
export default function Faq() {
  return (
    <div className="container faq">
      <h1>Frequently asked questions</h1>
      <p className="subtitle">How Birdie Quest tracks your game.</p>

      {FAQS.map((f) => (
        <details className="faq-item card" key={f.q}>
          <summary>{f.q}</summary>
          <div className="faq-answer">{f.a}</div>
        </details>
      ))}

      <p className="muted" style={{ marginTop: 24 }}>
        Still stuck? <Link to="/settings">Settings</Link> has tools for fixing course
        data, or reach out and we'll help.
      </p>
    </div>
  )
}

const FAQS = [
  {
    q: 'How is my handicap calculated?',
    a: (
      <>
        <p style={{ marginTop: 0 }}>
          Birdie Quest follows the World Handicap System (WHS). Each qualifying round
          gets a <strong>score differential</strong>:
        </p>
        <p><code>(113 ÷ slope) × (adjusted score − course rating)</code></p>
        <p>
          using the rating and slope of the tee you played. Your handicap is the
          average of your <strong>best differentials from your most recent 20
          qualifying rounds</strong> (the lowest 8 of 20, with adjustments when you
          have fewer), capped at 54.0. The only official input we can't include is
          the weather-based Playing Conditions Calculation.
        </p>
      </>
    ),
  },
  {
    q: 'Which rounds count toward my handicap?',
    a: (
      <p style={{ margin: 0 }}>
        Complete <strong>18-hole rounds on a full-size course</strong>. Scrambles,
        incomplete rounds, and par-3 courses are excluded automatically. Only your
        most recent 20 qualifying rounds are used — older ones roll off.
      </p>
    ),
  },
  {
    q: "Why didn't my handicap change after I added a round or fixed data?",
    a: (
      <p style={{ margin: 0 }}>
        Your handicap always uses the <strong>lowest 8</strong> of your last 20
        qualifying rounds. If a change doesn't affect one of those 8 best rounds,
        the number stays the same — that's expected, not a bug.
      </p>
    ),
  },
  {
    q: 'What is a stroke index?',
    a: (
      <p style={{ margin: 0 }}>
        It's the 1–18 ranking of a course's holes by where you receive handicap
        strokes — the “handicap” row on a scorecard. We use it to cap blow-up holes
        at net double bogey for handicap purposes. You can view it in the HCP column
        on any round, and edit it in <Link to="/settings">Settings → Course stroke
        index</Link>.
      </p>
    ),
  },
  {
    q: "What's net double bogey?",
    a: (
      <p style={{ margin: 0 }}>
        For handicap purposes only, each hole's score is capped at{' '}
        <strong>par + 2 + any handicap strokes you get on that hole</strong>. This
        keeps a single disaster hole from wrecking your handicap. Your actual
        scorecard and stats always show your real score.
      </p>
    ),
  },
  {
    q: 'Where does course data come from?',
    a: (
      <p style={{ margin: 0 }}>
        We combine two sources for accuracy: <strong>course &amp; slope ratings and
        the tee list from the USGA</strong> course rating database, and{' '}
        <strong>per-hole pars and stroke index from OpenGC</strong>. If a course
        isn't in these, you can add it as a custom course.
      </p>
    ),
  },
  {
    q: 'A course rating or hole looks wrong — can I fix it?',
    a: (
      <p style={{ margin: 0 }}>
        Yes. You can edit any played course's per-hole stroke index in{' '}
        <Link to="/settings">Settings → Course stroke index</Link> — it saves to the
        course and updates every round you've logged there. Pars and ratings come
        from the sources above.
      </p>
    ),
  },
  {
    q: "How do I add a course that isn't listed?",
    a: (
      <p style={{ margin: 0 }}>
        When adding a round, search for it by name. For a facility with several
        courses (like a 27-hole club), you'll pick which one you played. If it's
        genuinely not found, choose <strong>“+ Custom course”</strong> and enter the
        pars yourself.
      </p>
    ),
  },
  {
    q: 'Can I track putts, greens, and penalties?',
    a: (
      <p style={{ margin: 0 }}>
        Yes — optionally, per hole. Turn on stat tracking when logging a round to
        record putts, greens in regulation, and out-of-bounds, and they'll feed the
        stats on your dashboard.
      </p>
    ),
  },
  {
    q: 'Who can see my stats?',
    a: (
      <p style={{ margin: 0 }}>
        Your data is <strong>private by default</strong>. In{' '}
        <Link to="/settings">Settings → Sharing</Link> you can make your profile
        public so friends can look you up by email and view your stats read-only.
        You can switch back to private any time.
      </p>
    ),
  },
  {
    q: 'Is Birdie Quest free?',
    a: <p style={{ margin: 0 }}>Yes — completely free.</p>,
  },
]
