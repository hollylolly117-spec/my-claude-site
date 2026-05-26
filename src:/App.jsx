import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Nav          from './components/Nav.jsx'
import BlastBanner  from './components/BlastBanner.jsx'
import AuthPage     from './pages/AuthPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import HomePage     from './pages/HomePage.jsx'
import ProfilePage  from './pages/ProfilePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-3)', fontSize:13, fontFamily:'var(--font-mono)' }}>
    loading static...
  </div>
)

const Private = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/auth" replace />
}

const AppShell = () => {
  const { user } = useAuth()
  return (
    <>
      <BlastBanner />
      {user && <Nav />}
      <Routes>
        <Route path="/auth"    element={<AuthPage />} />
        <Route path="/welcome" element={<Private><OnboardingPage /></Private>} />
        <Route path="/"        element={<Private><HomePage /></Private>} />
        <Route path="/settings" element={<Private><SettingsPage /></Private>} />
        <Route path="/:username" element={<ProfilePage />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
