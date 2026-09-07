import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Login from './pages/Login'
import Signup from './pages/Signup'
import { refreshUser } from './redux/slices/authSlice'

function ProtectedRoute() {
  const { isAuthenticated } = useSelector(
    (state) => state.auth
  )

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function Dashboard() {
  const { user } = useSelector(
    (state) => state.auth
  )

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {user?.name}
      </h1>

      <p className="mt-2 text-gray-600">
        Finance Dashboard
      </p>
    </div>
  )
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) return

    dispatch(refreshUser())
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Router>
  )
}

export default App
