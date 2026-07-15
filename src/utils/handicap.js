// Handicap calculation.
//
// When we know the tee's course rating + slope (recorded on the round from the
// tee the golfer played), we use the World Handicap System score differential:
//
//   differential = (113 / slope) × (score − course rating)
//
// where 113 is the "standard" slope. This normalizes scores across tees and
// course difficulty, which is what makes a handicap comparable. Older rounds
// (logged before tees were tracked) and customs entered without ratings fall
// back to a raw (score − par) differential so they still contribute.
//
// The handicap is the average of the lowest differentials among the most recent
// 20 eligible 18-hole rounds, using the official WHS selection table (e.g.
// lowest 8 of 20, lowest 1 of 3–5, with small-set adjustments), capped at 54.0.
// Fewer than 3 eligible rounds returns null.
//
// Differentials use the Adjusted Gross Score (each hole capped at net double
// bogey) when we have the per-hole stroke index; otherwise they fall back to the
// gross score. The one WHS input we can't compute is the PCC (weather) term.

import { isParThreeCourse, isScramble } from './rounds.js'

// Score differential for a single round — WHS formula when the tee's rating and
// slope are known, otherwise the raw score-over-par fallback.
export function scoreDifferential(round) {
  const rating = round?.tee?.rating
  const slope = round?.tee?.slope
  if (typeof rating === 'number' && typeof slope === 'number' && slope > 0) {
    return (113 / slope) * (round.totalScore - rating)
  }
  return round.totalScore - round.totalPar
}

// Format a handicap for display using golf convention:
//   - a normal handicap (over par) is a plain number, e.g. "25.1"
//   - a "plus" handicap (better than scratch — our value is negative) gets a
//     leading +, e.g. "+2.4"
//   - scratch shows as "0.0"
// Returns '—' when there aren't enough rounds to compute one.
export function formatHandicap(h) {
  if (h == null) return '—'
  if (h < 0) return `+${(-h).toFixed(1)}`
  return h.toFixed(1)
}

export function calculateHandicap(rounds) {
  const eligible = rounds
    .filter((r) => !r.incomplete)
    .filter((r) => !isScramble(r))
    .filter((r) => !isParThreeCourse(r))
    .filter((r) => Array.isArray(r.holes) && r.holes.length === 18)
    .filter((r) => r.holes.every((h) => typeof h.score === 'number'))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 20)

  if (eligible.length < 3) return null

  // Net double bogey needs each round's course handicap, which needs the index —
  // a chicken/egg. Resolve it with two passes: a provisional index from gross
  // differentials, then the real index from the adjusted (capped) differentials.
  const provisional = indexFromDifferentials(eligible.map(scoreDifferential))
  const index = indexFromDifferentials(
    eligible.map((r) => adjustedDifferential(r, provisional))
  )
  return Math.round(Math.min(index, 54.0) * 10) / 10
}

// Average the lowest N differentials per the official WHS selection table, plus
// the small-set adjustment (−2.0 at 3 rounds, −1.0 at 4 and 6).
function indexFromDifferentials(diffs) {
  const { count, adjustment } = whsSelection(diffs.length)
  const best = [...diffs].sort((a, b) => a - b).slice(0, count)
  const avg = best.reduce((s, d) => s + d, 0) / best.length
  return avg + adjustment
}

function whsSelection(n) {
  if (n <= 3) return { count: 1, adjustment: -2.0 }
  if (n === 4) return { count: 1, adjustment: -1.0 }
  if (n === 5) return { count: 1, adjustment: 0 }
  if (n === 6) return { count: 2, adjustment: -1.0 }
  if (n <= 8) return { count: 2, adjustment: 0 }
  if (n <= 11) return { count: 3, adjustment: 0 }
  if (n <= 14) return { count: 4, adjustment: 0 }
  if (n <= 16) return { count: 5, adjustment: 0 }
  if (n <= 18) return { count: 6, adjustment: 0 }
  if (n === 19) return { count: 7, adjustment: 0 }
  return { count: 8, adjustment: 0 } // 20
}

// Score differential from the Adjusted Gross Score, capping each hole at net
// double bogey (par + 2 + strokes received) when the stroke index is known.
// Falls back to the plain gross differential when we lack rating/slope or the
// stroke index, so every round still contributes.
function adjustedDifferential(round, index) {
  const rating = round?.tee?.rating
  const slope = round?.tee?.slope
  if (!(typeof rating === 'number' && typeof slope === 'number' && slope > 0)) {
    return round.totalScore - round.totalPar
  }
  const holes = Array.isArray(round.holes) ? round.holes : []
  const courseHandicap = Math.round(index * (slope / 113) + (rating - round.totalPar))
  let adjustedTotal = 0
  for (const h of holes) {
    if (typeof h.score !== 'number') continue
    if (typeof h.par === 'number' && typeof h.si === 'number') {
      const cap = h.par + 2 + strokesOnHole(courseHandicap, h.si, holes.length)
      adjustedTotal += Math.min(h.score, cap)
    } else {
      adjustedTotal += h.score
    }
  }
  return (113 / slope) * (adjustedTotal - rating)
}

// WHS strokes received on a hole of the given stroke index for a course handicap.
function strokesOnHole(courseHandicap, si, holeCount) {
  if (!(si >= 1) || holeCount <= 0) return 0
  const base = Math.floor(courseHandicap / holeCount)
  const remainder = courseHandicap - base * holeCount
  return base + (si <= remainder ? 1 : 0)
}
