import { Link, useNavigate, useParams } from 'react-router-dom'
import RoundForm from '../components/RoundForm.jsx'
import { useData } from '../data/DataContext.jsx'

export default function EditRound() {
  const { id } = useParams()
  const { rounds, editRound, loading } = useData()
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

  const onSubmit = async (updated) => {
    await editRound(id, updated)
    nav(`/rounds/${id}`)
  }

  return (
    <RoundForm
      initialRound={round}
      onSubmit={onSubmit}
      heading="Edit round"
      submitLabel="Save changes"
      busyLabel="Saving…"
    />
  )
}
