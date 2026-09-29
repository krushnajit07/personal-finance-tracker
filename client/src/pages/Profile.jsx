import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfileThunk } from '../redux/slices/authSlice'
import { changePassword, getAccountStats } from '../services/authService'
import { useForm } from '../hooks/useForm'
import { formatCurrency } from '../utils/format'

function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { values: profile, handleChange: handleProfileChange, setValues: setProfile } = useForm({ name: '', email: '' })
  const { values: passwords, handleChange: handlePasswordChange, setValues: setPasswords } = useForm({ currentPassword: '', newPassword: '' })
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setProfile({ name: user?.name || '', email: user?.email || '' })
    const loadStats = async () => {
      try {
        const response = await getAccountStats()
        setStats(response.data?.data || null)
      } catch {
        setStats(null)
      }
    }
    loadStats()
  }, [user])

  const saveProfile = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await dispatch(updateProfileThunk(profile)).unwrap()
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err || 'Unable to update profile.')
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      setMessage('Password changed successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your details and secure your account.</p>
      </div>

      {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">User Details</h2>
          <form onSubmit={saveProfile} className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Save Profile</button>
            </div>
          </form>

          <h2 className="mt-6 text-lg font-semibold text-slate-800">Change Password</h2>
          <form onSubmit={savePassword} className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
              <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
              <input name="newPassword" type="password" minLength="6" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white">Change Password</button>
            </div>
          </form>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Account Statistics</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="text-xl font-semibold text-slate-800">{stats?.transactionCount || 0}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Income</p>
              <p className="text-xl font-semibold text-slate-800">{formatCurrency(stats?.totalIncome)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Expenses</p>
              <p className="text-xl font-semibold text-slate-800">{formatCurrency(stats?.totalExpense)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Savings</p>
              <p className="text-xl font-semibold text-slate-800">{formatCurrency(stats?.savings)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profile