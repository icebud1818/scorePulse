import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Nav() {
  const { user, logout } = useAuth()

  return (
    <nav className="nav">
      <div className="brand">
        score<span className="pulse">Pulse</span>
      </div>
      {user && (
        <>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/rounds">Rounds</NavLink>
          <NavLink to="/add">Add Round</NavLink>
          <NavLink to="/best">Best Scores</NavLink>
          <NavLink to="/achievements">Achievements</NavLink>
          <span className="muted" style={{ marginLeft: 12 }}>{user.email}</span>
          <button onClick={() => logout()}>Log out</button>
        </>
      )}
    </nav>
  )
}
