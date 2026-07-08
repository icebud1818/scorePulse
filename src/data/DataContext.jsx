import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  fetchEarnedAchievements,
  fetchRounds,
  recordAchievement,
  saveRound,
  updateRound as updateRoundFs,
  deleteRound as deleteRoundFs,
  deleteAchievement as deleteAchievementFs,
} from '../utils/firestore.js'
import { ACHIEVEMENTS, MANUAL_ACHIEVEMENT_IDS, computeEarnedAchievements } from './achievements.js'

const DataContext = createContext(null)

// Auto-reconciliation only ever adds/removes *auto* achievements (ones with a
// check). Manual achievements the user toggles themselves are never in this
// set, so the recompute can't wipe them — and a definition deleted from the
// code never nukes a stored doc either.
const AUTO_IDS = new Set(
  ACHIEVEMENTS.filter((a) => !MANUAL_ACHIEVEMENT_IDS.has(a.id)).map((a) => a.id)
)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [rounds, setRounds] = useState([])
  const [earnedIds, setEarnedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastEarned, setLastEarned] = useState([])

  // Recompute earned achievements from the full set of rounds and reconcile
  // Firestore + local state: award anything newly qualifying, revoke anything
  // that no longer fits. Only writes to Firestore when the set actually
  // changes. Returns the achievements newly earned (for the toast).
  const syncAchievements = useCallback(
    async (nextRounds, priorEarnedIds) => {
      const computed = computeEarnedAchievements(nextRounds)
      const prior = new Set(priorEarnedIds)
      const toAdd = [...computed].filter((id) => !prior.has(id))
      const toRemove = [...prior].filter((id) => AUTO_IDS.has(id) && !computed.has(id))

      await Promise.all([
        ...toAdd.map((id) => recordAchievement(user.uid, id)),
        ...toRemove.map((id) => deleteAchievementFs(user.uid, id)),
      ])

      const nextEarnedIds = [...prior]
        .filter((id) => !toRemove.includes(id))
        .concat(toAdd)
      setEarnedIds(nextEarnedIds)

      const newlyEarned = ACHIEVEMENTS.filter((a) => toAdd.includes(a.id))
      return { newlyEarned }
    },
    [user]
  )

  const reload = useCallback(async () => {
    if (!user) {
      setRounds([])
      setEarnedIds([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [rs, achs] = await Promise.all([
        fetchRounds(user.uid),
        fetchEarnedAchievements(user.uid),
      ])
      setRounds(rs)
      // Self-heal on load: reconcile stored achievements against what the
      // rounds actually earn now. This revokes achievements that no longer
      // qualify (e.g. one earned on a course since flagged par-3) without
      // waiting for the next add/edit/delete.
      await syncAchievements(rs, achs.map((a) => a.id))
    } finally {
      setLoading(false)
    }
  }, [user, syncAchievements])

  useEffect(() => {
    reload()
  }, [reload])

  const addRound = useCallback(
    async (round) => {
      if (!user) throw new Error('Not authenticated')
      const id = await saveRound(user.uid, round)
      const newRound = { id, ...round }
      const nextRounds = [newRound, ...rounds]
      setRounds(nextRounds)
      const { newlyEarned } = await syncAchievements(nextRounds, earnedIds)
      setLastEarned(newlyEarned)
      return { id, newlyEarned }
    },
    [user, rounds, earnedIds, syncAchievements]
  )

  const editRound = useCallback(
    async (roundId, round) => {
      if (!user) throw new Error('Not authenticated')
      await updateRoundFs(user.uid, roundId, round)
      const nextRounds = rounds.map((r) =>
        r.id === roundId ? { ...r, ...round } : r
      )
      setRounds(nextRounds)
      const { newlyEarned } = await syncAchievements(nextRounds, earnedIds)
      setLastEarned(newlyEarned)
      return { id: roundId, newlyEarned }
    },
    [user, rounds, earnedIds, syncAchievements]
  )

  const removeRound = useCallback(
    async (roundId) => {
      if (!user) return
      await deleteRoundFs(user.uid, roundId)
      const nextRounds = rounds.filter((r) => r.id !== roundId)
      setRounds(nextRounds)
      await syncAchievements(nextRounds, earnedIds)
    },
    [user, rounds, earnedIds, syncAchievements]
  )

  const clearLastEarned = useCallback(() => setLastEarned([]), [])

  // Toggle a manually-tracked achievement (e.g. "Chip-In"). Writes/removes the
  // Firestore doc directly and updates local state; the auto-reconciliation
  // leaves these alone, so they persist.
  const setManualAchievement = useCallback(
    async (id, earned) => {
      if (!user) return
      // Optimistic local update, then persist.
      setEarnedIds((prev) => {
        if (earned) return prev.includes(id) ? prev : [...prev, id]
        return prev.filter((x) => x !== id)
      })
      if (earned) await recordAchievement(user.uid, id)
      else await deleteAchievementFs(user.uid, id)
    },
    [user]
  )

  return (
    <DataContext.Provider
      value={{
        rounds,
        earnedIds,
        loading,
        addRound,
        editRound,
        removeRound,
        setManualAchievement,
        lastEarned,
        clearLastEarned,
        reload,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
