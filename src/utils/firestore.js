import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'

// Firestore layout (all per-user, isolated by security rules):
//   users/{uid}/rounds/{roundId}       — one doc per submitted round
//   users/{uid}/achievements/{achId}   — one doc per earned achievement

function roundsCol(uid) {
  return collection(db, 'users', uid, 'rounds')
}
function achievementsCol(uid) {
  return collection(db, 'users', uid, 'achievements')
}

export async function fetchRounds(uid) {
  const snap = await getDocs(query(roundsCol(uid), orderBy('date', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveRound(uid, round) {
  const ref = await addDoc(roundsCol(uid), {
    ...round,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteRound(uid, roundId) {
  await deleteDoc(doc(db, 'users', uid, 'rounds', roundId))
}

export async function fetchEarnedAchievements(uid) {
  const snap = await getDocs(achievementsCol(uid))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function recordAchievement(uid, achievementId) {
  await setDoc(doc(db, 'users', uid, 'achievements', achievementId), {
    earnedAt: serverTimestamp(),
  })
}
