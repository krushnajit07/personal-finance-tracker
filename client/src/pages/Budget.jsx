import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBudget, saveBudget } from '../redux/slices/budgetSlice'
import { getDashboardSummary } from '../services/dashboardService'
import { categories, formatCurrency } from '../utils/format'

function Budget() {
  const dispatch = useDispatch()
  const budget = useSelector((state) => state.budget)
  const [monthlyBudget, setMonthlyBudget] = useState('0')
  const [categoryBudgets, setCategoryBudgets] = useState([])
  const [summary, setSummary] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    dispatch(fetchBudget())
    const loadSummary = async () => {
      try {
        const response = await getDashboardSummary()
        setSummary(response.data?.data || null)
      } catch {
        setSummary(null)
      }
    }
    loadSummary()
  }, [dispatch])

  useEffect(() => {
    setMonthlyBudget(String(budget.monthlyBudget || 0))
    setCategoryBudgets(budget.categories || [])
  }, [budget])

  const addCategory = () => setCategoryBudgets((prev) => [...prev, { category: 'Food', limit: 0 }])
  const updateCategory = (index, field, value) => {
    setCategoryBudgets((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }
  const removeCategory = (index) => setCategoryBudgets((prev) => prev.filter((_, i) => i !== index))

  const save = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      await dispatch(saveBudget({ monthlyBudget: Number(monthlyBudget), categoryBudgets })).unwrap()
      const response = await getDashboardSummary()
      setSummary(response.data?.data || null)
      setMessage('Budget saved successfully.')
    } catch (err) {
      setMessage(err || 'Unable to save budget.')
    }
  }

  const totalExpense = summary?.totalExpense || 0
  const remaining = Number(monthlyBudget || 0) - totalExpense
  const usedPercent = Number(monthlyBudget || 0) > 0 ? Math.min(100, (totalExpense / Number(monthlyBudget)) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Budget Planner</h1>
        <p className="mt-1 text-sm text-slate-500">Set your monthly budget and cap category spending.</p>
      </div>

      {message && <div className={`rounded-lg border p-3 text-sm ${message.includes('Unable') ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</div>}
      {budget.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{budget.error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <form onSubmit={save} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Monthly Budget</label>
              <input type="number" min="0" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Category Budgets</h2>
              <button type="button" onClick={addCategory} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Add Category</button>
            </div>

            <div className="space-y-3">
              {categoryBudgets.map((item, index) => {
                const spent = summary?.categoryBreakdown?.find((entry) => entry.category === item.category)?.amount || 0
                const percent = Number(item.limit || 0) > 0 ? Math.min(100, (spent / Number(item.limit)) * 100) : 0
                return (
                  <div key={`${item.category}-${index}`} className="rounded-lg border border-slate-200 p-3">
                    <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
                      <select value={item.category} onChange={(e) => updateCategory(index, 'category', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2">
                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                      <input type="number" min="0" value={item.limit} onChange={(e) => updateCategory(index, 'limit', Number(e.target.value))} className="rounded-lg border border-slate-200 px-3 py-2" />
                      <button type="button" onClick={() => removeCategory(index)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">Remove</button>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                        <span>Spent: {formatCurrency(spent)}</span>
                        <span>{Math.round(percent)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${percent >= 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button type="submit" disabled={budget.loading} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-70">
              {budget.loading ? 'Saving...' : 'Save Budget'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Monthly Progress</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Spent</p>
              <p className="text-xl font-semibold text-slate-800">{formatCurrency(totalExpense)}</p>
            </div>
            <div className={`rounded-lg p-3 ${remaining < 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <p className="text-sm">Remaining</p>
              <p className="text-xl font-semibold">{formatCurrency(remaining)}</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                <span>Budget used</span>
                <span>{Math.round(usedPercent)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${usedPercent >= 100 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${usedPercent}%` }} />
              </div>
            </div>
            {remaining < 0 && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">You are overspending this month.</div>}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Budget