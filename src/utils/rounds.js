import { getCourse } from '../data/courses.js'

// Helpers for reasoning about complete vs. partial (incomplete) rounds.
//
// A round is "incomplete" when the golfer didn't finish what they set out to
// play — e.g. only played 9 of an 18-hole course, or walked off early. These
// rounds are still stored and shown, but they're excluded from the handicap,
// achievements, and best-score-of-round stats. Individual holes they *did*
// play still carry real scores.

export function holesPlayed(round) {
  if (!Array.isArray(round?.holes)) return 0
  return round.holes.filter((h) => typeof h.score === 'number').length
}

// True if the round is flagged incomplete, or (defensively) if it's missing a
// score on any of its holes — so old/hand-edited data can't slip through.
export function isIncomplete(round) {
  if (round?.incomplete === true) return true
  if (!Array.isArray(round?.holes)) return true
  return round.holes.some((h) => typeof h.score !== 'number')
}

// True if the round was played on a par-3 / executive course (flagged
// `par3: true` in courses.js). Only preset courses carry the flag; custom
// rounds have no courseId, so they're never treated as par-3.
export function isParThreeCourse(round) {
  if (!round?.courseId) return false
  return getCourse(round.courseId)?.par3 === true
}

// Rounds that count toward stats (handicap, achievements): fully played,
// nothing missing, and not on a par-3 course.
export function isCountable(round) {
  return !isIncomplete(round) && !isParThreeCourse(round)
}
