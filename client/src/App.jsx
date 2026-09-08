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
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import { refreshUser } from './redux/slices/authSlice'

function ProtectedRoute() {
  const { isAuthenticated } = useSelector(
    (state) => state.auth
  )

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
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
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />}/>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Router>
  )
}

export default App
