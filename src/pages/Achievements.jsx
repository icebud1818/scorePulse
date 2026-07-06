import { ACHIEVEMENTS } from '../data/achievements.js'
import { useData } from '../data/DataContext.jsx'

export default function Achievements() {
  const { earnedIds, loading } = useData()

  if (loading) return <div className="container center muted">Loading…</div>

  const earnedSet = new Set(earnedIds)
  const earned = ACHIEVEMENTS.filter((a) => earnedSet.has(a.id))
  const locked = ACHIEVEMENTS.filter((a) => !earnedSet.has(a.id))

  return (
    <div className="container">
      <h1>Achievements</h1>
      <div className="muted" style={{ marginBottom: 20 }}>
        {earned.length} of {ACHIEVEMENTS.length} earned
      </div>

      {earned.length > 0 && (
        <>
          <h2>Earned</h2>
          <div className="grid cols-2">
            {earned.map((a) => (
              <div className="achievement" key={a.id}>
                <div className="badge">★</div>
                <div>
                  <div className="title">{a.name}</div>
                  <div className="desc">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {locked.length > 0 && (
        <>
          <h2>Locked</h2>
          <div className="grid cols-2">
            {locked.map((a) => (
              <div className="achievement locked" key={a.id}>
                <div className="badge">?</div>
                <div>
                  <div className="title">{a.name}</div>
                  <div className="desc">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
