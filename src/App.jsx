import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import { ThemeProvider } from './theme/ThemeContext.jsx'
import { DataProvider } from './data/DataContext.jsx'
import Nav from './components/Nav.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AchievementToast from './components/AchievementToast.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddRound from './pages/AddRound.jsx'
import EditRound from './pages/EditRound.jsx'
import RoundsList from './pages/RoundsList.jsx'
import RoundDetail from './pages/RoundDetail.jsx'
import BestScores from './pages/BestScores.jsx'
import Records from './pages/Records.jsx'
import Achievements from './pages/Achievements.jsx'
import Settings from './pages/Settings.jsx'
import FriendLookup from './pages/FriendLookup.jsx'
import FriendStats from './pages/FriendStats.jsx'
import Faq from './pages/Faq.jsx'

// A single DataProvider wraps all authed routes (mounted only once the user is
// logged in), so data loads once per session instead of on every navigation.
function AppRoutes() {
  const { user } = useAuth()
  const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>

  const routes = (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/" element={user ? protect(<Dashboard />) : <Home />} />
      <Route path="/add" element={protect(<AddRound />)} />
      <Route path="/rounds" element={protect(<RoundsList />)} />
      <Route path="/rounds/:id" element={protect(<RoundDetail />)} />
      <Route path="/rounds/:id/edit" element={protect(<EditRound />)} />
      <Route path="/best" element={protect(<BestScores />)} />
      <Route path="/records" element={protect(<Records />)} />
      <Route path="/achievements" element={protect(<Achievements />)} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/settings" element={protect(<Settings />)} />
      <Route path="/friends" element={protect(<FriendLookup />)} />
      <Route path="/u/:uid" element={protect(<FriendStats />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )

  return (
    <>
      <Nav />
      {user ? (
        <DataProvider>
          {routes}
          <AchievementToast />
        </DataProvider>
      ) : (
        routes
      )}
    </>
  )
}

export default function App() {
  return (
    <div className="app">
      <HashRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </HashRouter>
    </div>
  )
}
