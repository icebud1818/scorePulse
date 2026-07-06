import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COURSES, getCourse } from '../data/courses.js'
import { useData } from '../data/DataContext.jsx'

const CUSTOM = '__custom__'

function todayIso() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AddRound() {
  const { addRound } = useData()
  const nav = useNavigate()

  const [date, setDate] = useState(todayIso())
  const [courseId, setCourseId] = useState(COURSES[0]?.id || CUSTOM)
  const [customName, setCustomName] = useState('')
  const [customHoleCount, setCustomHoleCount] = useState(18)
  const [holes, setHoles] = useState(() => makeHolesFor(COURSES[0]?.id || CUSTOM, 18))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const preset = courseId !== CUSTOM ? getCourse(courseId) : null

  const onCourseChange = (nextId) => {
    setCourseId(nextId)
    if (nextId === CUSTOM) {
      setHoles(blankHoles(customHoleCount, /*editablePar*/ true))
    } else {
      setHoles(makeHolesFor(nextId, 18))
    }
  }

  const onCustomHoleCountChange = (n) => {
    setCustomHoleCount(n)
    if (courseId === CUSTOM) setHoles(blankHoles(n, true))
  }

  const updateHole = (idx, field, value) => {
    setHoles((prev) => prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h)))
  }

  const { totalScore, totalPar, filledScoreCount } = useMemo(() => {
    let s = 0, p = 0, filled = 0
    for (const h of holes) {
      if (typeof h.score === 'number') { s += h.score; filled++ }
      if (typeof h.par === 'number') p += h.par
    }
    return { totalScore: s, totalPar: p, filledScoreCount: filled }
  }, [holes])

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const courseName = courseId === CUSTOM ? customName.trim() : preset?.name
    if (!courseName) {
      setError('Enter a course name.')
      return
    }
    if (!date) {
      setError('Pick a date.')
      return
    }
    if (filledScoreCount !== holes.length) {
      setError('Enter a score for every hole.')
      return
    }
    if (courseId === CUSTOM && holes.some((h) => typeof h.par !== 'number')) {
      setError('Enter a par for every hole.')
      return
    }

    const cleanedHoles = holes.map((h) => {
      const out = { par: h.par, score: h.score }
      if (typeof h.putts === 'number') out.putts = h.putts
      if (typeof h.ob === 'number' && h.ob > 0) out.ob = h.ob
      if (h.gir === true) out.gir = true
      return out
    })

    const round = {
      date,
      courseId: courseId === CUSTOM ? null : courseId,
      courseName,
      holes: cleanedHoles,
      totalScore,
      totalPar,
    }

    setBusy(true)
    try {
      const { id } = await addRound(round)
      nav(`/rounds/${id}`)
    } catch (err) {
      setError(err.message || 'Failed to save round.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <h1>Log a round</h1>
      <form onSubmit={submit}>
        <div className="card">
          <div className="grid cols-3">
            <div>
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label>Course</label>
              <select value={courseId} onChange={(e) => onCourseChange(e.target.value)}>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value={CUSTOM}>+ Custom course…</option>
              </select>
            </div>
            {courseId === CUSTOM && (
              <>
                <div>
                  <label>Custom course name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Pebble Beach"
                    required
                  />
                </div>
                <div>
                  <label>Number of holes</label>
                  <select
                    value={customHoleCount}
                    onChange={(e) => onCustomHoleCountChange(Number(e.target.value))}
                  >
                    <option value={9}>9</option>
                    <option value={18}>18</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Holes</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="holes-table">
              <thead>
                <tr>
                  <th>Hole</th>
                  <th>Par</th>
                  <th>Score</th>
                  <th>Putts</th>
                  <th>OB</th>
                  <th>GIR</th>
                </tr>
              </thead>
              <tbody>
                {holes.map((h, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      {courseId === CUSTOM ? (
                        <input
                          type="number"
                          min="3" max="6"
                          value={h.par ?? ''}
                          onChange={(e) => updateHole(i, 'par', numOrNull(e.target.value))}
                          required
                        />
                      ) : (
                        h.par
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={h.score ?? ''}
                        onChange={(e) => updateHole(i, 'score', numOrNull(e.target.value))}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={h.putts ?? ''}
                        onChange={(e) => updateHole(i, 'putts', numOrNull(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={h.ob ?? ''}
                        onChange={(e) => updateHole(i, 'ob', numOrNull(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={h.gir === true}
                        onChange={(e) => updateHole(i, 'gir', e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th>{totalPar || '—'}</th>
                  <th>{totalScore || '—'}</th>
                  <th colSpan="3" className="muted" style={{ textAlign: 'left', paddingLeft: 16 }}>
                    {filledScoreCount}/{holes.length} holes filled
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="row">
          <button className="primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save round'}
          </button>
        </div>
      </form>
    </div>
  )
}

function makeHolesFor(courseId, defaultCount) {
  const c = getCourse(courseId)
  if (c) return c.pars.map((par) => ({ par, score: null, putts: null, ob: null, gir: false }))
  return blankHoles(defaultCount, true)
}

function blankHoles(count, editablePar) {
  return Array.from({ length: count }, () => ({
    par: editablePar ? null : 4,
    score: null,
    putts: null,
    ob: null,
    gir: false,
  }))
}

function numOrNull(v) {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
