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
// The handicap is the average of the best ~40% (up to 8) of the most recent 20
// eligible 18-hole rounds. Fewer than 3 eligible rounds returns null. This
// selection is a simplification of the official WHS "lowest 8 of 20" table, but
// it tracks improvement well for casual play.

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

  const differentials = eligible.map(scoreDifferential)
  const bestCount = Math.min(8, Math.max(1, Math.floor(eligible.length * 0.4)))
  const best = [...differentials].sort((a, b) => a - b).slice(0, bestCount)
  const avg = best.reduce((s, d) => s + d, 0) / best.length
  return Math.round(avg * 10) / 10
}
