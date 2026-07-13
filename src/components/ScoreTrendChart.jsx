import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { isParThreeCourse, isScramble } from '../utils/rounds.js'
import { scoreDifferential, calculateHandicap } from '../utils/handicap.js'

// Scoring trend: each eligible round's score differential (dots) plus the
// handicap recomputed as of each round (line). Lower is better, so an
// improving game slopes downward. Uses the same eligibility as the handicap
// (complete, non-scramble, 18-hole, non-par-3 rounds), capped to the most
// recent 20 — the handicap's own window.
export default function ScoreTrendChart({ rounds }) {
  const points = useMemo(() => buildTrend(rounds), [rounds])
  const nav = useNavigate()

  if (points.length < 3) {
    return (
      <div className="muted">
        Log 3+ complete 18-hole rounds to see your scoring trend.
      </div>
    )
  }

  // Layout (viewBox units; the SVG scales to its container width).
  const W = 640
  const H = 220
  const padL = 34
  const padR = 12
  const padT = 12
  const padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = points.length

  const ys = [
    ...points.map((p) => p.diff),
    ...points.filter((p) => p.handicap != null).map((p) => p.handicap),
  ]
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const range = yMax - yMin || 1
  const yLo = yMin - range * 0.12
  const yHi = yMax + range * 0.12

  const x = (i) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  // Lower value (better) sits toward the bottom of the plot.
  const y = (v) => padT + ((yHi - v) / (yHi - yLo)) * plotH

  const rawLine = points.map((p, i) => `${x(i)},${y(p.diff)}`).join(' ')
  const hcapLine = points
    .filter((p) => p.handicap != null)
    .map((p) => `${x(p.index)},${y(p.handicap)}`)
    .join(' ')

  const fmt = (v) => (Math.round(v) === v ? v : v.toFixed(1))

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        role="img"
        aria-label="Scoring trend chart"
      >
        {/* Y guide labels: worst at top, best at bottom. */}
        <text x={padL - 6} y={y(yMax) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
          {fmt(yMax)}
        </text>
        <text x={padL - 6} y={y(yMin) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
          {fmt(yMin)}
        </text>
        <line
          x1={padL} y1={padT} x2={padL} y2={padT + plotH}
          stroke="var(--border)" strokeWidth="1"
        />
        <line
          x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH}
          stroke="var(--border)" strokeWidth="1"
        />

        {/* Per-round differentials: faint connecting line + dots. */}
        <polyline points={rawLine} fill="none" stroke="var(--muted)" strokeWidth="1" opacity="0.4" />
        {hcapLine && (
          <polyline
            points={hcapLine}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {points.map((p, i) => (
          <circle
            key={p.round.id}
            cx={x(i)}
            cy={y(p.diff)}
            r="3.5"
            fill="var(--muted)"
            style={{ cursor: 'pointer' }}
            onClick={() => nav(`/rounds/${p.round.id}`)}
          >
            <title>
              {`${p.round.date} · ${p.round.courseName} · ${p.round.totalScore} (diff ${p.diff.toFixed(1)})`}
            </title>
          </circle>
        ))}
      </svg>

      <div className="row" style={{ marginTop: 10, gap: 16, fontSize: '0.82rem', color: 'var(--muted)' }}>
        <span className="row" style={{ gap: 6 }}>
          <span style={{ width: 18, height: 3, borderRadius: 2, background: 'var(--accent)' }} />
          Handicap trend
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--muted)' }} />
          Per-round
        </span>
        <div className="spacer" />
        <span>Lower is better</span>
      </div>
      <div className="row" style={{ marginTop: 2, fontSize: '0.78rem', color: 'var(--muted)' }}>
        <span>{points[0].round.date}</span>
        <div className="spacer" />
        <span>{points[n - 1].round.date}</span>
      </div>
    </div>
  )
}

function buildTrend(rounds) {
  const eligible = rounds
    .filter((r) => !r.incomplete && !isScramble(r) && !isParThreeCourse(r))
    .filter((r) => Array.isArray(r.holes) && r.holes.length === 18)
    .filter((r) => r.holes.every((h) => typeof h.score === 'number'))
    .sort((a, b) => (a.date || '').localeCompare(b.date || '')) // oldest → newest
    .slice(-20)

  return eligible.map((r, i) => ({
    index: i,
    round: r,
    diff: scoreDifferential(r),
    handicap: calculateHandicap(eligible.slice(0, i + 1)),
  }))
}
