import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { downloadMonthlyReport, getMonthlyReport } from '../services/reportService'
import { formatCurrency, formatDate } from '../utils/format'

function Reports() {
  const [period, setPeriod] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => ({ ...period }), [period])

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getMonthlyReport(params)
        setReport(response.data?.data || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load report.')
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [params])

  const exportPdf = async () => {
    try {
      const response = await downloadMonthlyReport(params)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finance-report-${period.year}-${String(period.month).padStart(2, '0')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to export report.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Review month-by-month performance and export a PDF summary.</p>
        </div>
        <button onClick={exportPdf} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Export PDF
        </button>
      </div>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Month</label>
            <select value={period.month} onChange={(e) => setPeriod((prev) => ({ ...prev, month: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2">
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>{new Date(0, index).toLocaleString('en-US', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
            <input type="number" value={period.year} onChange={(e) => setPeriod((prev) => ({ ...prev, year: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          </div>
        </div>
      </section>

      {loading && <div className="rounded-lg border bg-white p-6 text-slate-600">Loading report...</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {report && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Income', report.totalIncome, 'green'],
              ['Expense', report.totalExpense, 'red'],
              ['Savings', report.savings, 'blue'],
              ['Remaining', report.budgetRemaining, 'slate']
            ].map(([label, value, tone]) => (
              <div key={label} className={`rounded-lg border p-4 shadow-sm ${tone === 'green' ? 'border-emerald-200 bg-emerald-50' : tone === 'red' ? 'border-rose-200 bg-rose-50' : tone === 'blue' ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                <p className="text-sm font-medium text-slate-600">{label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-800">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
              <h2 className="text-lg font-semibold text-slate-800">Category Analytics</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.categoryBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">Transactions</h2>
              <div className="mt-4 max-h-72 space-y-3 overflow-auto">
                {report.transactions?.length ? report.transactions.map((item) => (
                  <div key={item._id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.category} • {formatDate(item.transactionDate)}</p>
                      </div>
                      <p className={`font-semibold ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">No transactions for this period.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports