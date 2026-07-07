import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { useData } from '../data/DataContext.jsx'
import { ACHIEVEMENTS } from '../data/achievements.js'
import { calculateHandicap } from '../utils/handicap.js'
import { isCountable, isIncomplete } from '../utils/rounds.js'

export default function Dashboard() {
  const { user } = useAuth()
  const { rounds, earnedIds, loading } = useData()

  if (loading) return <div className="container center muted">Loading…</div>

  const handicap = calculateHandicap(rounds)
  const totalRounds = rounds.length
  const eighteenHoleRounds = rounds.filter(
    (r) => r.holes?.length === 18 && isCountable(r)
  )
  const bestScore = eighteenHoleRounds.length
    ? Math.min(...eighteenHoleRounds.map((r) => r.totalScore))
    : null
  const lastRound = rounds[0]

  return (
    <div className="container">
      <h1>Welcome back, {user?.email?.split('@')[0]}</h1>

      <div className="grid cols-3">
        <div className="card">
          <div className="muted">Handicap</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {handicap == null ? '—' : handicap > 0 ? `+${handicap}` : handicap}
          </div>
          <div className="muted" style={{ fontSize: '0.85rem' }}>
            {handicap == null ? 'Need 3+ 18-hole rounds' : 'Simplified (score − par)'}
          </div>
        </div>
        <div className="card">
          <div className="muted">Rounds logged</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalRounds}</div>
        </div>
        <div className="card">
          <div className="muted">Best 18-hole score</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{bestScore ?? '—'}</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Recent round</h2>
          {lastRound ? (
            <div>
              <div>
                <strong>{lastRound.courseName}</strong>
                {isIncomplete(lastRound) && (
                  <span className="tag incomplete" style={{ marginLeft: 8 }}>Incomplete</span>
                )}
              </div>
              <div className="muted">{lastRound.date}</div>
              <div style={{ marginTop: 8 }}>
                Score: <strong>{lastRound.totalScore}</strong> (par {lastRound.totalPar})
              </div>
              <div style={{ marginTop: 12 }}>
                <Link to={`/rounds/${lastRound.id}`}>View details →</Link>
              </div>
            </div>
          ) : (
            <div className="muted">
              No rounds yet. <Link to="/add">Log your first round</Link>.
            </div>
          )}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Achievements</h2>
          <div>
            <strong>{earnedIds.length}</strong> of {ACHIEVEMENTS.length} earned
          </div>
          <div style={{ marginTop: 12 }}>
            <Link to="/achievements">See all →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
