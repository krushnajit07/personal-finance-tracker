import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTransactions,
  removeTransactionById,
  saveTransaction
} from '../redux/slices/transactionSlice'
import { useForm } from '../hooks/useForm'
import { categories, formatCurrency, formatDate, paymentMethods } from '../utils/format'

const emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10)
}

function Transactions() {
  const dispatch = useDispatch()
  const { transactions, pagination, loading, error } = useSelector((state) => state.transactions)
  const [filters, setFilters] = useState({ search: '', type: '', category: '', sort: 'latest', page: 1 })
  const { values: form, setValues: setForm, setFieldValue } = useForm(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const query = useMemo(() => ({ ...filters, limit: 10 }), [filters])

  useEffect(() => {
    dispatch(fetchTransactions(query))
  }, [dispatch, query])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditingId(item._id)
    setForm({
      type: item.type,
      title: item.title,
      amount: item.amount,
      category: item.category,
      paymentMethod: item.paymentMethod || 'upi',
      description: item.description || '',
      transactionDate: item.transactionDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
    })
    setShowForm(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'page') {
      setFilters((prev) => ({ ...prev, page: Number(value) }))
      return
    }
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      await dispatch(saveTransaction({ id: editingId, data: form })).unwrap()
      setShowForm(false)
      setMessage(editingId ? 'Transaction updated.' : 'Transaction created.')
      dispatch(fetchTransactions(query))
    } catch (err) {
      setMessage(err || 'Unable to save transaction.')
    }
  }

  const deleteItem = async (item) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await dispatch(removeTransactionById(item._id)).unwrap()
      setMessage('Transaction deleted.')
      dispatch(fetchTransactions(query))
    } catch (err) {
      setMessage(err || 'Unable to delete transaction.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">Manage income and expense entries in one place.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          Add Transaction
        </button>
      </div>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <input name="search" value={filters.search} onChange={handleChange} placeholder="Search" className="rounded-lg border border-slate-200 px-3 py-2" />
          <select name="type" value={filters.type} onChange={handleChange} className="rounded-lg border border-slate-200 px-3 py-2">
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select name="category" value={filters.category} onChange={handleChange} className="rounded-lg border border-slate-200 px-3 py-2">
            <option value="">All</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select name="sort" value={filters.sort} onChange={handleChange} className="rounded-lg border border-slate-200 px-3 py-2">
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="amount_desc">Amount high→low</option>
            <option value="amount_asc">Amount low→high</option>
          </select>
          <button onClick={() => setFilters({ search: '', type: '', category: '', sort: 'latest', page: 1 })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Reset filters
          </button>
        </div>
      </section>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {message && <div className={`rounded-lg border p-3 text-sm ${message.includes('Unable') || message.includes('failed') ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</div>}

      <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-500">Loading transactions...</td></tr>
              ) : transactions.length ? transactions.map((item) => (
                <tr key={item._id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{item.type}</span></td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{formatDate(item.transactionDate)}</td>
                  <td className="px-4 py-3">{item.paymentMethod}</td>
                  <td className={`px-4 py-3 font-semibold ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50">Edit</button>
                      <button onClick={() => deleteItem(item)} className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50">Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-500">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <span>Page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))} className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <button disabled={pagination.page >= pagination.pages} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button onClick={() => setShowForm(false)} className="text-sm text-slate-500">Close</button>
            </div>
            <form onSubmit={submitForm} className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select name="type" value={form.type} onChange={(e) => setFieldValue('type', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input required name="title" value={form.title} onChange={(e) => setFieldValue('title', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Amount</label>
                <input required type="number" min="1" name="amount" value={form.amount} onChange={(e) => setFieldValue('amount', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select name="category" value={form.category} onChange={(e) => setFieldValue('category', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2">
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Payment Method</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={(e) => setFieldValue('paymentMethod', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2">
                  {paymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Date</label>
                <input required type="date" name="transactionDate" value={form.transactionDate} onChange={(e) => setFieldValue('transactionDate', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea name="description" value={form.description} onChange={(e) => setFieldValue('description', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" rows="3" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-70">
                  {loading ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions