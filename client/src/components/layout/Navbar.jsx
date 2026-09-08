import { useSelector } from 'react-redux'

function Navbar() {
  const { user } = useSelector((state) => state.auth)

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Finance Dashboard</h2>
          <p className="text-sm text-slate-500">Stay on top of your money in real time.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{user?.name || 'Welcome'}</p>
          <p className="text-xs text-slate-500">{user?.email || 'Signed in'}</p>
        </div>
      </div>
    </nav>
  )
}

export default Navbar