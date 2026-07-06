import { Link } from 'react-router-dom'
import { useData } from '../data/DataContext.jsx'

export default function RoundsList() {
  const { rounds, loading } = useData()

  if (loading) return <div className="container center muted">Loading…</div>

  return (
    <div className="container">
      <div className="row">
        <h1 style={{ margin: 0 }}>Rounds</h1>
        <div className="spacer" />
        <Link to="/add"><button className="primary">+ Add round</button></Link>
      </div>

      {rounds.length === 0 ? (
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
              {rounds.map((r) => {
                const diff = r.totalScore - r.totalPar
                return (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.courseName}</td>
                    <td>{r.holes?.length ?? '—'}</td>
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
