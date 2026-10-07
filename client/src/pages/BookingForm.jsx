import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Server sends 2026-10-10T00:00:00.000Z, <input type="date"> needs 2026-10-10
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '')

export default function BookingForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    roomNumber: '',
    startDate: '',
    endDate: '',
    purpose: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  // TODO 3: when the URL has an id, load the booking and autofill the form
  useEffect(() => {
    if (!isEdit) return
    let cancelled = false

    api
      .get(`/bookings/${id}`)
      .then(({ data }) => {
        if (cancelled) return
        // Works whether the server returns the booking directly or as { booking }
        const b = data.booking || data
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || '',
        })
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Could not load this booking')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  // TODO 1: one handler for every input, keyed by the input's name attribute
  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  // TODO 2 + 3: POST when creating, PATCH when editing
  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // No bookedBy here: the server takes the booker from the token
      const payload = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose,
      }

      if (isEdit) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }

      navigate('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="p-6">Loading booking…</p>

  const inputClass =
    'w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600'

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        {isEdit ? 'Edit booking' : 'Book a room'}
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Room number</span>
          <input
            className={inputClass}
            type="text"
            name="roomNumber"
            placeholder="B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Start date</span>
          <input
            className={inputClass}
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">End date</span>
          <input
            className={inputClass}
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Purpose (optional)
          </span>
          <textarea
            className={inputClass}
            name="purpose"
            rows={3}
            value={form.purpose}
            onChange={onChange}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Book room'}
        </button>
      </form>
    </div>
  )
}