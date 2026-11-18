import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { closeMobileMenu } from '../../redux/slices/navigationSlice'

function Sidebar() {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobileMenuOpen = useSelector(
    (state) => state.navigation.isMobileMenuOpen
  )

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Budget', path: '/budget' },
    { label: 'Insights', path: '/insights' },
    { label: 'Reports', path: '/reports' },
    { label: 'Profile', path: '/profile' }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(closeMobileMenu())
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      {isMobileMenuOpen && (
        <button
          type="button"
          onClick={() => dispatch(closeMobileMenu())}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close navigation menu"
        />
      )}
      <aside
        id="primary-navigation"
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white transition-transform duration-300 md:static md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="border-b border-slate-700 p-6">
          <p className="text-xl font-semibold">FinTrack</p>
          <p className="mt-1 text-sm text-slate-400">AI finance tracker</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => dispatch(closeMobileMenu())}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar