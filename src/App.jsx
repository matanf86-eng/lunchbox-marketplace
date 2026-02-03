import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import ScanLunchbox from './pages/ScanLunchbox'
import Marketplace from './pages/Marketplace'
import CreateOffer from './pages/CreateOffer'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/" />
}

function App() {
  const user = localStorage.getItem('user')

  return (
    <BrowserRouter>
      <div className="min-h-screen" dir="rtl">
        <Routes>
          {/* Welcome/Entry */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Welcome />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <ScanLunchbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-offer"
            element={
              <ProtectedRoute>
                <CreateOffer />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
