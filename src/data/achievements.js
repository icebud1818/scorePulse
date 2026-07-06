// Add achievements here. Each has:
//   id: unique string (used as the Firestore doc id — don't change once earned)
//   name: display title
//   description: shown to the user
//   check(round, allRounds): returns true if this round earned it.
//     - round: the newly-submitted round { date, courseName, holes: [{ par, score, putts?, ob?, gir? }], totalScore, totalPar }
//     - allRounds: array of all previously-saved rounds (does NOT include the new one)

export const ACHIEVEMENTS = [
  {
    id: 'first-round',
    name: 'First Round',
    description: 'Log your first round on scorePulse.',
    check: (round, allRounds) => allRounds.length === 0,
  },
  {
    id: 'break-100',
    name: 'Breaking 100',
    description: 'Shoot under 100 on an 18-hole round.',
    check: (round) => round.holes.length === 18 && round.totalScore < 100,
  },
  {
    id: 'break-90',
    name: 'Breaking 90',
    description: 'Shoot under 90 on an 18-hole round.',
    check: (round) => round.holes.length === 18 && round.totalScore < 90,
  },
  {
    id: 'first-birdie',
    name: 'First Birdie',
    description: 'Score one under par on any hole.',
    check: (round) => round.holes.some((h) => h.score != null && h.score === h.par - 1),
  },
  // Add more here — see README for examples.
]

export function evaluateAchievements(round, allRounds, alreadyEarnedIds) {
  const newlyEarned = []
  for (const ach of ACHIEVEMENTS) {
    if (alreadyEarnedIds.includes(ach.id)) continue
    try {
      if (ach.check(round, allRounds)) newlyEarned.push(ach)
    } catch (e) {
      console.warn(`Achievement "${ach.id}" check threw:`, e)
    }
  }
  return newlyEarned
}
