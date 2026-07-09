import { useEffect } from 'react'
import { useData } from '../data/DataContext.jsx'
import { iconForAchievement } from '../data/achievements.js'

export default function AchievementToast() {
  const { lastEarned, clearLastEarned } = useData()

  useEffect(() => {
    if (lastEarned.length === 0) return
    const t = setTimeout(() => clearLastEarned(), 5000)
    return () => clearTimeout(t)
  }, [lastEarned, clearLastEarned])

  if (lastEarned.length === 0) return null
  return (
    <div className="toast" onClick={clearLastEarned} style={{ cursor: 'pointer' }}>
      🏆 Achievement unlocked!
      <div style={{ fontWeight: 400, marginTop: 4 }}>
        {lastEarned.map((a) => `${iconForAchievement(a)} ${a.name}`).join(', ')}
      </div>
    </div>
  )
}
