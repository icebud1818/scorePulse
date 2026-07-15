import { useMemo, useState } from 'react'
import { useData } from '../data/DataContext.jsx'
import { courseLookupEnabled, importClubCourses, searchCourses } from '../utils/courseApi.js'

// One-time tool (Settings) to add per-hole stroke index ("handicap") to courses
// you've already played on but that were imported/created without it. Fill the
// numbers by searching OpenGC or by pasting them, then apply — it writes the
// stroke index to the course and to every round you've logged there, so the
// handicap's net-double-bogey cap and the round page's HCP column light up.
export default function StrokeIndexBackfill() {
  const { rounds, courses, getCourse, backfillCourseStrokeIndex } = useData()

  // Courses you've played that are missing a full stroke index.
  const needing = useMemo(() => {
    const playedIds = new Set(rounds.map((r) => r.courseId).filter(Boolean))
    return courses
      .filter((c) => playedIds.has(c.id))
      .filter((c) => Array.isArray(c.pars) && c.pars.length > 0)
      .filter((c) => !hasStrokeIndex(c))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [rounds, courses])

  const [courseId, setCourseId] = useState('')
  const [siText, setSiText] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [choices, setChoices] = useState(null)
  const [searching, setSearching] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const selected = courseId ? getCourse(courseId) : needing[0]
  const activeId = selected?.id || ''
  const holeCount = selected?.pars?.length || 18

  if (!courseLookupEnabled) return null

  const reset = () => {
    setSiText('')
    setQuery('')
    setResults([])
    setChoices(null)
    setError('')
  }

  const onSelectCourse = (id) => {
    setCourseId(id)
    reset()
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

  const pickClub = async (r) => {
    setBusy(true)
    setError('')
    try {
      const found = await importClubCourses(r.externalId)
      const withSi = found.filter((c) => hasStrokeIndex(c) && c.pars.length === holeCount)
      if (withSi.length === 0) {
        setError('That facility has no stroke index for a matching course.')
      } else if (withSi.length === 1) {
        setSiText(withSi[0].strokeIndexes.join(', '))
        setResults([])
        setChoices(null)
      } else {
        setChoices(withSi)
      }
    } catch (err) {
      setError(err.message || 'Lookup failed.')
    } finally {
      setBusy(false)
    }
  }

  const pickChoice = (c) => {
    setSiText(c.strokeIndexes.join(', '))
    setResults([])
    setChoices(null)
  }

  const parsed = parseSi(siText)
  const valid = isValidStrokeIndex(parsed, holeCount)

  const apply = async () => {
    if (!activeId || !valid) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const n = await backfillCourseStrokeIndex(activeId, parsed)
      setMessage(`Updated ${selected.name} and ${n} round${n === 1 ? '' : 's'}.`)
      setCourseId('')
      reset()
    } catch (err) {
      setError(err.message || 'Could not apply.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Course stroke index</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Add the per-hole stroke index (the “handicap” row on a scorecard) to
        courses you played before it was tracked. This powers the net-double-bogey
        cap in your handicap and the HCP column on each round.
      </p>

      {needing.length === 0 ? (
        <div className="muted">All your played courses have a stroke index. 🎉</div>
      ) : (
        <>
          <label>Course to update</label>
          <select value={activeId} onChange={(e) => onSelectCourse(e.target.value)}>
            {needing.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.pars.length} holes)
              </option>
            ))}
          </select>

          <label style={{ marginTop: 12 }}>Fill from search</label>
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
                  onClick={() => pickChoice(c)}
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

          <label style={{ marginTop: 12 }}>
            Stroke index ({holeCount} numbers, 1–{holeCount})
          </label>
          <input
            type="text"
            value={siText}
            onChange={(e) => setSiText(e.target.value)}
            placeholder="e.g. 7, 13, 11, 9, 15, 3, 17, 1, 5, 8, 6, 16, 2, 10, 12, 4, 18, 14"
          />
          <div className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
            {siText.trim() === ''
              ? 'Search above to auto-fill, or paste the numbers.'
              : valid
                ? '✓ Valid — each hole 1 to ' + holeCount + ' used once.'
                : `Must be the numbers 1–${holeCount}, each exactly once (currently ${parsed.length}).`}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="row" style={{ marginTop: 12 }}>
            <button className="primary" onClick={apply} disabled={!valid || busy}>
              {busy ? 'Applying…' : 'Apply to course & rounds'}
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

function parseSi(text) {
  return String(text || '')
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
}

function isValidStrokeIndex(si, len) {
  if (si.length !== len) return false
  if (si.some((n) => !Number.isInteger(n))) return false
  const seen = new Set(si)
  if (seen.size !== len) return false
  for (let i = 1; i <= len; i++) if (!seen.has(i)) return false
  return true
}
