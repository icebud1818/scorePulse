import { useMemo } from 'react'
import { useData } from '../data/DataContext.jsx'

export default function BestScores() {
  const { rounds, loading } = useData()

  const byCourse = useMemo(() => {
    // Group rounds by course name (courses with the same name are treated as
    // one, including custom ones typed manually).
    const groups = new Map()
    for (const r of rounds) {
      if (!Array.isArray(r.holes)) continue
      const key = r.courseName
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(r)
    }
    // For each course, compute best score per hole index across all rounds
    // that had that many holes (or more).
    const out = []
    for (const [name, courseRounds] of groups) {
      const holeCount = Math.max(...courseRounds.map((r) => r.holes.length))
      const bestPerHole = []
      for (let i = 0; i < holeCount; i++) {
        let best = null
        let par = null
        for (const r of courseRounds) {
          const h = r.holes[i]
          if (!h || typeof h.score !== 'number') continue
          if (best == null || h.score < best) best = h.score
          if (par == null) par = h.par
        }
        bestPerHole.push({ par, best })
      }
      out.push({ name, holeCount, bestPerHole, roundCount: courseRounds.length })
    }
    return out.sort((a, b) => a.name.localeCompare(b.name))
  }, [rounds])

  if (loading) return <div className="container center muted">Loading…</div>

  return (
    <div className="container">
      <h1>Best scores per hole</h1>
      {byCourse.length === 0 ? (
        <div className="card center muted">Log a round to see your best scores.</div>
      ) : (
        byCourse.map((c) => {
          const totalBest = c.bestPerHole.reduce((s, h) => s + (h.best ?? 0), 0)
          const totalPar = c.bestPerHole.reduce((s, h) => s + (h.par ?? 0), 0)
          return (
            <div className="card" key={c.name}>
              <div className="row">
                <h2 style={{ margin: 0 }}>{c.name}</h2>
                <div className="spacer" />
                <span className="muted">{c.roundCount} round{c.roundCount === 1 ? '' : 's'}</span>
              </div>
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table className="holes-table">
                  <thead>
                    <tr>
                      <th></th>
                      {c.bestPerHole.map((_, i) => <th key={i}>{i + 1}</th>)}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Par</th>
                      {c.bestPerHole.map((h, i) => <td key={i} className="muted">{h.par ?? '—'}</td>)}
                      <td className="muted"><strong>{totalPar}</strong></td>
                    </tr>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Best</th>
                      {c.bestPerHole.map((h, i) => {
                        const diff = h.best != null && h.par != null ? h.best - h.par : null
                        const color = diff == null ? 'var(--muted)'
                          : diff < 0 ? 'var(--accent)'
                          : diff === 0 ? 'var(--text)'
                          : 'var(--warn)'
                        return <td key={i} style={{ color, fontWeight: 600 }}>{h.best ?? '—'}</td>
                      })}
                      <td><strong>{totalBest}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
