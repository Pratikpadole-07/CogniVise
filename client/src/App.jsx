import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import GoalSetup from './pages/GoalSetup.jsx'
import StudyPlan from './pages/StudyPlan.jsx'
import DailySchedule from './pages/DailySchedule.jsx'
import Topics from './pages/Topics.jsx'
import Analytics from './pages/Analytics.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'
import Layout from './components/layout/Layout.jsx'
import { useAuth } from './hooks/useAuth.js'

function Protected({ children }) {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

export default function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goal" element={<GoalSetup />} />
        <Route path="/plan" element={<StudyPlan />} />
        <Route path="/schedule" element={<DailySchedule />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

