import { firebaseConfigured } from '../firebase.js'

export default function ConfigWarning() {
  if (firebaseConfigured) return null
  return (
    <div className="card" style={{ borderColor: 'var(--warn)', color: 'var(--warn)' }}>
      <strong>Firebase isn't configured yet.</strong>
      <div className="muted" style={{ marginTop: 8 }}>
        Copy <code>.env.example</code> to <code>.env.local</code> and fill in
        your Firebase project values. See the README for step-by-step setup.
      </div>
    </div>
  )
}
