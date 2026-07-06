import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  fetchEarnedAchievements,
  fetchRounds,
  recordAchievement,
  saveRound,
  deleteRound as deleteRoundFs,
} from '../utils/firestore.js'
import { evaluateAchievements } from './achievements.js'

const DataContext = createContext(null)

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

  const addRound = useCallback(
    async (round) => {
      if (!user) throw new Error('Not authenticated')
      const id = await saveRound(user.uid, round)
      const newRound = { id, ...round }
      const priorRounds = rounds
      const priorEarned = earnedIds
      const newlyEarned = evaluateAchievements(newRound, priorRounds, priorEarned)
      for (const ach of newlyEarned) {
        await recordAchievement(user.uid, ach.id)
      }
      setRounds([newRound, ...priorRounds])
      setEarnedIds([...priorEarned, ...newlyEarned.map((a) => a.id)])
      setLastEarned(newlyEarned)
      return { id, newlyEarned }
    },
    [user, rounds, earnedIds]
  )

  const removeRound = useCallback(
    async (roundId) => {
      if (!user) return
      await deleteRoundFs(user.uid, roundId)
      setRounds((rs) => rs.filter((r) => r.id !== roundId))
    },
    [user]
  )

  const clearLastEarned = useCallback(() => setLastEarned([]), [])

  return (
    <DataContext.Provider
      value={{ rounds, earnedIds, loading, addRound, removeRound, lastEarned, clearLastEarned, reload }}
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
