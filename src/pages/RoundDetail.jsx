import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../data/DataContext.jsx'

export default function RoundDetail() {
  const { id } = useParams()
  const { rounds, removeRound, loading } = useData()
  const nav = useNavigate()

  if (loading) return <div className="container center muted">Loading…</div>

  const round = rounds.find((r) => r.id === id)
  if (!round) {
    return (
      <div className="container">
        <p className="muted">Round not found.</p>
        <Link to="/rounds">← Back to rounds</Link>
      </div>
    )
  }

  const onDelete = async () => {
    if (!confirm('Delete this round? This cannot be undone.')) return
    await removeRound(round.id)
    nav('/rounds')
  }

  const diff = round.totalScore - round.totalPar

  return (
    <div className="container">
      <div className="row">
        <Link to="/rounds">← All rounds</Link>
        <div className="spacer" />
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>

      <h1>{round.courseName}</h1>
      <div className="muted" style={{ marginBottom: 20 }}>{round.date}</div>

      <div className="grid cols-3">
        <div className="card">
          <div className="muted">Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{round.totalScore}</div>
        </div>
        <div className="card">
          <div className="muted">Par</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{round.totalPar}</div>
        </div>
        <div className="card">
          <div className="muted">vs Par</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
            {diff > 0 ? `+${diff}` : diff}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
        <table className="holes-table">
          <thead>
            <tr>
              <th>Hole</th>
              <th>Par</th>
              <th>Score</th>
              <th>vs Par</th>
              <th>Putts</th>
              <th>OB</th>
              <th>GIR</th>
            </tr>
          </thead>
          <tbody>
            {round.holes.map((h, i) => {
              const d = h.score - h.par
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{h.par}</td>
                  <td><strong>{h.score}</strong></td>
                  <td style={{ color: d < 0 ? 'var(--accent)' : d === 0 ? 'var(--muted)' : d <= 1 ? 'var(--text)' : 'var(--warn)' }}>
                    {d > 0 ? `+${d}` : d}
                  </td>
                  <td>{h.putts ?? '—'}</td>
                  <td>{h.ob ?? '—'}</td>
                  <td>{h.gir ? '✓' : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
