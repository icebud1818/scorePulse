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
import { ACHIEVEMENTS, computeEarnedAchievements } from './achievements.js'

const DataContext = createContext(null)

// Only achievements defined in the app are ever added or removed here, so a
// definition that's been deleted from the code never nukes a stored doc.
const KNOWN_IDS = new Set(ACHIEVEMENTS.map((a) => a.id))

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [rounds, setRounds] = useState([])
  const [earnedIds, setEarnedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastEarned, setLastEarned] = useState([])

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
      setEarnedIds(achs.map((a) => a.id))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  // Recompute earned achievements from the full set of rounds and reconcile
  // Firestore + local state: award anything newly qualifying, revoke anything
  // that no longer fits. Returns the achievements newly earned (for the toast).
  const syncAchievements = useCallback(
    async (nextRounds, priorEarnedIds) => {
      const computed = computeEarnedAchievements(nextRounds)
      const prior = new Set(priorEarnedIds)
      const toAdd = [...computed].filter((id) => !prior.has(id))
      const toRemove = [...prior].filter((id) => KNOWN_IDS.has(id) && !computed.has(id))

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

  return (
    <DataContext.Provider
      value={{
        rounds,
        earnedIds,
        loading,
        addRound,
        editRound,
        removeRound,
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
