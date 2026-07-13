import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isParThreeCourse, isScramble } from '../utils/rounds.js'
import { scoreDifferential, calculateHandicap } from '../utils/handicap.js'

// Rounds that count toward the trend — same eligibility as the handicap
// (complete, non-scramble, 18-hole, non-par-3), capped to the most recent 20.
function eligibleRounds(rounds) {
  return rounds
    .filter((r) => !r.incomplete && !isScramble(r) && !isParThreeCourse(r))
    .filter((r) => Array.isArray(r.holes) && r.holes.length === 18)
    .filter((r) => r.holes.every((h) => typeof h.score === 'number'))
    .sort((a, b) => (a.date || '').localeCompare(b.date || '')) // oldest → newest
    .slice(-20)
}

// Mean of the trailing `window` values ending at index i.
function rollingAvg(values, i, window) {
  const slice = values.slice(Math.max(0, i - window + 1), i + 1)
  return slice.reduce((s, v) => s + v, 0) / slice.length
}

// Each metric defines the per-round dot value and its trend line.
const METRICS = {
  strokes: {
    key: 'strokes',
    label: 'Strokes',
    value: (r) => r.totalScore,
    trend: (rounds, values) => values.map((_, i) => rollingAvg(values, i, 5)),
    trendLabel: '5-round average',
    fmt: (v) => Math.round(v),
    tip: (r) => `${r.date} · ${r.courseName} · ${r.totalScore}`,
  },
  differential: {
    key: 'differential',
    label: 'Score',
    value: (r) => scoreDifferential(r),
    // Handicap recomputed as of each round.
    trend: (rounds) => rounds.map((_, i) => calculateHandicap(rounds.slice(0, i + 1))),
    trendLabel: 'Handicap trend',
    fmt: (v) => (Math.round(v) === v ? v : v.toFixed(1)),
    tip: (r) => `${r.date} · ${r.courseName} · ${r.totalScore} (diff ${scoreDifferential(r).toFixed(1)})`,
  },
}

// Scoring trend: each eligible round as a dot, plus a trend line. Lower is
// better, so an improving game slopes downward. Toggle the metric between raw
// stroke totals and tee-adjusted score (differential + handicap).
export default function ScoreTrendChart({ rounds }) {
  const eligible = useMemo(() => eligibleRounds(rounds), [rounds])
  const [metric, setMetric] = useState('strokes')
  const nav = useNavigate()

  if (eligible.length < 3) {
    return (
      <div className="muted">
        Log 3+ complete 18-hole rounds to see your scoring trend.
      </div>
    )
  }

  const cfg = METRICS[metric]
  const dotVals = eligible.map(cfg.value)
  const trendVals = cfg.trend(eligible, dotVals)

  // Layout (viewBox units; the SVG scales to its container width).
  const W = 640
  const H = 220
  const padL = 34
  const padR = 12
  const padT = 12
  const padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = eligible.length

  const ys = [...dotVals, ...trendVals.filter((v) => v != null)]
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const range = yMax - yMin || 1
  const yLo = yMin - range * 0.12
  const yHi = yMax + range * 0.12

  const x = (i) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  // Lower value (better) sits toward the bottom of the plot.
  const y = (v) => padT + ((yHi - v) / (yHi - yLo)) * plotH

  const rawLine = dotVals.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const trendLine = trendVals
    .map((v, i) => (v == null ? null : `${x(i)},${y(v)}`))
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <div className="spacer" />
        <div className="segmented">
          {Object.values(METRICS).map((m) => (
            <button
              key={m.key}
              className={metric === m.key ? 'active' : ''}
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        role="img"
        aria-label="Scoring trend chart"
      >
        {/* Y guide labels: worst at top, best at bottom. */}
        <text x={padL - 6} y={y(yMax) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
          {cfg.fmt(yMax)}
        </text>
        <text x={padL - 6} y={y(yMin) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
          {cfg.fmt(yMin)}
        </text>
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--border)" strokeWidth="1" />
        <line
          x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH}
          stroke="var(--border)" strokeWidth="1"
        />

        {/* Per-round values: faint connecting line + dots. */}
        <polyline points={rawLine} fill="none" stroke="var(--muted)" strokeWidth="1" opacity="0.4" />
        {trendLine && (
          <polyline
            points={trendLine}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {eligible.map((r, i) => (
          <circle
            key={r.id}
            cx={x(i)}
            cy={y(dotVals[i])}
            r="3.5"
            fill="var(--muted)"
            style={{ cursor: 'pointer' }}
            onClick={() => nav(`/rounds/${r.id}`)}
          >
            <title>{cfg.tip(r)}</title>
          </circle>
        ))}
      </svg>

      <div className="row" style={{ marginTop: 10, gap: 16, fontSize: '0.82rem', color: 'var(--muted)' }}>
        <span className="row" style={{ gap: 6 }}>
          <span style={{ width: 18, height: 3, borderRadius: 2, background: 'var(--accent)' }} />
          {cfg.trendLabel}
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--muted)' }} />
          Per-round
        </span>
        <div className="spacer" />
        <span>Lower is better</span>
      </div>
      <div className="row" style={{ marginTop: 2, fontSize: '0.78rem', color: 'var(--muted)' }}>
        <span>{eligible[0].date}</span>
        <div className="spacer" />
        <span>{eligible[n - 1].date}</span>
      </div>
    </div>
  )
}
