import { useEffect, useMemo, useState } from 'react'
import { useData } from '../data/DataContext.jsx'
import { courseLookupEnabled, importClubCourses, searchCourses } from '../utils/courseApi.js'

// Settings tool to view / edit the per-hole stroke index ("handicap") for any
// course you've played. Fill or fix it by editing each hole directly or pulling
// from OpenGC, with a guard that every number 1..N is present exactly once. On
// apply it writes to the course and to every round you've logged there, so the
// handicap's net-double-bogey cap and the round page's HCP column use it.
export default function StrokeIndexBackfill() {
  const { rounds, courses, getCourse, backfillCourseStrokeIndex } = useData()

  // Every course you've played (needs-stroke-index ones first).
  const played = useMemo(() => {
    const ids = new Set(rounds.map((r) => r.courseId).filter(Boolean))
    return courses
      .filter((c) => ids.has(c.id) && Array.isArray(c.pars) && c.pars.length > 0)
      .sort((a, b) => {
        const am = hasStrokeIndex(a) ? 1 : 0
        const bm = hasStrokeIndex(b) ? 1 : 0
        return am - bm || a.name.localeCompare(b.name)
      })
  }, [rounds, courses])

  const [courseId, setCourseId] = useState('')
  const [values, setValues] = useState([]) // per-hole stroke index, as strings
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [choices, setChoices] = useState(null)
  const [searching, setSearching] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const selected = (courseId && getCourse(courseId)) || played[0] || null
  const activeId = selected?.id || ''
  const holeCount = selected?.pars?.length || 0

  // Load the selected course's current stroke index into the editable grid.
  useEffect(() => {
    const c = activeId ? getCourse(activeId) : null
    const n = c?.pars?.length || 0
    const cur = Array.isArray(c?.strokeIndexes) && c.strokeIndexes.length === n ? c.strokeIndexes : []
    setValues(Array.from({ length: n }, (_, i) => (cur[i] != null ? String(cur[i]) : '')))
    setQuery('')
    setResults([])
    setChoices(null)
    setError('')
  }, [activeId, getCourse])

  if (!courseLookupEnabled && played.length === 0) return null

  const parsed = values.map((v) => (v.trim() === '' ? null : Number(v)))
  const counts = new Map()
  parsed.forEach((n) => n != null && counts.set(n, (counts.get(n) || 0) + 1))
  const missing = []
  for (let i = 1; i <= holeCount; i++) if (!counts.has(i)) missing.push(i)
  const duplicates = [...counts.entries()].filter(([, c]) => c > 1).map(([n]) => n)
  const outOfRange = parsed.some((n) => n != null && (!Number.isInteger(n) || n < 1 || n > holeCount))
  const valid = holeCount > 0 && missing.length === 0 && duplicates.length === 0 && !outOfRange

  const setHole = (i, v) => {
    setValues((prev) => prev.map((x, idx) => (idx === i ? v.replace(/[^0-9]/g, '') : x)))
    setMessage('')
  }

  const runSearch = async () => {
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setError('')
    setChoices(null)
    try {
      setResults(await searchCourses(q))
    } catch (err) {
      setError(err.message || 'Search failed.')
    } finally {
      setSearching(false)
    }
  }

  const useSourceCourse = (c) => {
    setValues(c.strokeIndexes.map(String))
    setResults([])
    setChoices(null)
  }

  const pickClub = async (r) => {
    setBusy(true)
    setError('')
    try {
      const found = await importClubCourses(r.externalId)
      const withSi = found.filter((c) => hasStrokeIndex(c) && c.pars.length === holeCount)
      if (withSi.length === 0) setError('That facility has no stroke index for a matching course.')
      else if (withSi.length === 1) useSourceCourse(withSi[0])
      else setChoices(withSi)
    } catch (err) {
      setError(err.message || 'Lookup failed.')
    } finally {
      setBusy(false)
    }
  }

  const apply = async () => {
    if (!activeId || !valid) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const n = await backfillCourseStrokeIndex(activeId, parsed)
      setMessage(`Saved ${selected.name} and updated ${n} round${n === 1 ? '' : 's'}.`)
    } catch (err) {
      setError(err.message || 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Course stroke index</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Set or correct each hole's stroke index (the “handicap” row on a
        scorecard). It powers the net-double-bogey cap in your handicap and the
        HCP column on each round.
      </p>

      {played.length === 0 ? (
        <div className="muted">Log a round on a course to edit its stroke index.</div>
      ) : (
        <>
          <label>Course</label>
          <select value={activeId} onChange={(e) => setCourseId(e.target.value)}>
            {played.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {hasStrokeIndex(c) ? '' : ' — needs stroke index'}
              </option>
            ))}
          </select>

          {courseLookupEnabled && (
            <>
              <label style={{ marginTop: 12 }}>Fill from search (optional)</label>
              <div className="row" style={{ gap: 8 }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), runSearch())}
                  placeholder={`Search for ${selected?.name || 'the course'}…`}
                />
                <button type="button" onClick={runSearch} disabled={searching || !query.trim()}>
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>

              {choices ? (
                <div className="grid" style={{ marginTop: 8 }}>
                  {choices.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className="achievement"
                      onClick={() => useSourceCourse(c)}
                      disabled={busy}
                      style={{ textAlign: 'left' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div className="title">{c.name}</div>
                        <div className="desc">stroke index: {c.strokeIndexes.join(', ')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                results.length > 0 && (
                  <div className="grid" style={{ marginTop: 8 }}>
                    {results.map((r) => (
                      <button
                        type="button"
                        key={r.externalId}
                        className="achievement"
                        onClick={() => pickClub(r)}
                        disabled={busy}
                        style={{ textAlign: 'left' }}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="title">{r.name}</div>
                          {r.location && <div className="desc">{r.location}</div>}
                        </div>
                        <span className="muted">{busy ? '…' : 'Use'}</span>
                      </button>
                    ))}
                  </div>
                )
              )}
            </>
          )}

          <label style={{ marginTop: 12 }}>Stroke index per hole</label>
          <div className="si-grid">
            {values.map((v, i) => {
              const n = v.trim() === '' ? null : Number(v)
              const dupe = n != null && counts.get(n) > 1
              const bad = n != null && (!Number.isInteger(n) || n < 1 || n > holeCount)
              return (
                <div className="si-cell" key={i}>
                  <span className="si-hole">Hole {i + 1}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={v}
                    onChange={(e) => setHole(i, e.target.value)}
                    className={dupe || bad ? 'si-bad' : undefined}
                    aria-label={`Stroke index for hole ${i + 1}`}
                  />
                </div>
              )
            })}
          </div>

          <div className="muted" style={{ fontSize: '0.82rem' }}>
            {valid
              ? `✓ Valid — every number 1 to ${holeCount} used once.`
              : [
                  missing.length ? `Missing: ${missing.join(', ')}` : '',
                  duplicates.length ? `Duplicated: ${duplicates.join(', ')}` : '',
                  outOfRange ? `Out of range (must be 1–${holeCount})` : '',
                ]
                  .filter(Boolean)
                  .join(' · ') || `Enter a value 1–${holeCount} for every hole.`}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="row" style={{ marginTop: 12 }}>
            <button className="primary" onClick={apply} disabled={!valid || busy}>
              {busy ? 'Saving…' : 'Save to course & rounds'}
            </button>
          </div>
        </>
      )}

      {message && <div className="success" style={{ marginTop: 12 }}>{message}</div>}
    </div>
  )
}

function hasStrokeIndex(course) {
  return (
    Array.isArray(course.strokeIndexes) &&
    course.strokeIndexes.length === (course.pars?.length || 0) &&
    isValidStrokeIndex(course.strokeIndexes, course.pars.length)
  )
}

function isValidStrokeIndex(si, len) {
  if (si.length !== len) return false
  if (si.some((n) => !Number.isInteger(n))) return false
  const seen = new Set(si)
  if (seen.size !== len) return false
  for (let i = 1; i <= len; i++) if (!seen.has(i)) return false
  return true
}
