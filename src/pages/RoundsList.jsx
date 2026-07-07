import { Link } from 'react-router-dom'
import { useData } from '../data/DataContext.jsx'
import { holesPlayed, isIncomplete, isParThreeCourse } from '../utils/rounds.js'

export default function RoundsList() {
  const { rounds, loading } = useData()

  // Always show most-recently-played first, regardless of the order local
  // add/edit operations left the array in.
  const sorted = [...rounds].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  if (loading) return <div className="container center muted">Loading…</div>

  return (
    <div className="container">
      <div className="row">
        <h1 style={{ margin: 0 }}>Rounds</h1>
        <div className="spacer" />
        <Link to="/add"><button className="primary">+ Add round</button></Link>
      </div>

      {sorted.length === 0 ? (
        <div className="card center muted">
          No rounds yet. <Link to="/add">Log your first one</Link>.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Holes</th>
                <th>Score</th>
                <th>Par</th>
                <th>Diff</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const diff = r.totalScore - r.totalPar
                const incomplete = isIncomplete(r)
                const total = r.holes?.length ?? 0
                return (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>
                      {r.courseName}
                      {isParThreeCourse(r) && <span className="tag" style={{ marginLeft: 8 }}>Par 3</span>}
                      {incomplete && <span className="tag incomplete" style={{ marginLeft: 8 }}>Incomplete</span>}
                    </td>
                    <td>{incomplete ? `${holesPlayed(r)}/${total}` : total || '—'}</td>
                    <td><strong>{r.totalScore}</strong></td>
                    <td className="muted">{r.totalPar}</td>
                    <td style={{ color: diff <= 0 ? 'var(--accent)' : diff <= 5 ? 'var(--text)' : 'var(--warn)' }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td><Link to={`/rounds/${r.id}`}>View</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
