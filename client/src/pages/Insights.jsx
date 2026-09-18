import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInsights, fetchPrediction } from '../redux/slices/insightSlice'
import { formatCurrency } from '../utils/format'

function Insights() {
  const dispatch = useDispatch()
  const { insights, predictions, provider, loading, error } = useSelector((state) => state.insights)

  useEffect(() => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }, [dispatch])

  const refreshInsights = () => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Insights</h1>
          <p className="mt-1 text-sm text-slate-500">Get AI-assisted recommendations for your spending habits.</p>
        </div>
        <button onClick={refreshInsights} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Refresh Insights
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Recommendations</h2>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{provider || 'heuristic'}</span>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Generating insights...</p>
          ) : insights.length ? (
            <div className="space-y-3">
              {insights.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Add transactions to generate insights.</p>
          )}
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Spending Prediction</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Predicted Expense</p>
              <p className="text-xl font-semibold text-slate-800">{formatCurrency(predictions.predictedExpense)}</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                <span>Confidence</span>
                <span>{predictions.confidence || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${predictions.confidence || 0}%` }} />
              </div>
            </div>
            {predictions.budgetRisk && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Predicted spending is above your monthly budget.</div>}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Insights