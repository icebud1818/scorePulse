import { ACHIEVEMENTS } from '../data/achievements.js'
import { useData } from '../data/DataContext.jsx'

export default function Achievements() {
  const { earnedIds, setManualAchievement, loading } = useData()

  if (loading) return <div className="container center muted">Loading…</div>

  const earnedSet = new Set(earnedIds)
  const auto = ACHIEVEMENTS.filter((a) => !a.manual)
  const manual = ACHIEVEMENTS.filter((a) => a.manual)
  const earned = auto.filter((a) => earnedSet.has(a.id))
  const locked = auto.filter((a) => !earnedSet.has(a.id))
  const earnedCount = ACHIEVEMENTS.filter((a) => earnedSet.has(a.id)).length

  return (
    <div className="container">
      <h1>Achievements</h1>
      <div className="muted" style={{ marginBottom: 20 }}>
        {earnedCount} of {ACHIEVEMENTS.length} earned
      </div>

      {manual.length > 0 && (
        <>
          <h2 style={{ marginTop: 0 }}>Log it yourself</h2>
          <p className="muted" style={{ marginTop: -8 }}>
            Feats we can't spot from your scores — check them off as you pull them off.
          </p>
          <div className="grid cols-2">
            {manual.map((a) => {
              const done = earnedSet.has(a.id)
              return (
                <label
                  className={`achievement ${done ? '' : 'locked'}`}
                  key={a.id}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="badge">{done ? '★' : '○'}</div>
                  <div style={{ flex: 1 }}>
                    <div className="title">{a.name}</div>
                    <div className="desc">{a.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => setManualAchievement(a.id, e.target.checked)}
                    style={{ width: 'auto', marginTop: 4 }}
                  />
                </label>
              )
            })}
          </div>
        </>
      )}

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
