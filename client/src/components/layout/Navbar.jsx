import { useDispatch, useSelector } from 'react-redux'
import { toggleMobileMenu } from '../../redux/slices/navigationSlice'

function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const isMobileMenuOpen = useSelector(
    (state) => state.navigation.isMobileMenuOpen
  )
  const dispatch = useDispatch()

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(toggleMobileMenu())}
            className="shrink-0 rounded-lg bg-white p-2 text-black shadow-md md:hidden"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-800 sm:text-lg">Finance Dashboard</h2>
            <p className="hidden text-sm text-slate-500 sm:block">Stay on top of your money in real time.</p>
          </div>
        </div>
        <div className="max-w-[40%] truncate text-right">
          <p className="truncate text-sm font-medium text-slate-800">{user?.name || 'Welcome'}</p>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{user?.email || 'Signed in'}</p>
        </div>
      </div>
    </nav>
  )
}

export default Navbar