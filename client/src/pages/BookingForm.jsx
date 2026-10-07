import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function toDateInputValue(value) {
  const match = String(value || '').match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    async function loadBooking() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/bookings/${id}`, { signal: controller.signal })
        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: toDateInputValue(booking.startDate),
          endDate: toDateInputValue(booking.endDate),
          purpose: booking.purpose || ''
        })
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err?.response?.data?.message || 'Failed to load booking')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadBooking()
    return () => controller.abort()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return

    setError('')
    setSubmitting(true)

    const bookingData = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, bookingData)
      } else {
        await api.post('/bookings', bookingData)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-lg mx-auto card text-sm text-zinc-600">Loading booking...</div>
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="roomNumber">Room number</label>
          <input
            className="input"
            id="roomNumber"
            name="roomNumber"
            type="text"
            placeholder="B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="startDate">Start date</label>
          <input
            className="input"
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="endDate">End date</label>
          <input
            className="input"
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="purpose">Purpose (optional)</label>
          <textarea
            className="input"
            id="purpose"
            name="purpose"
            rows="3"
            value={form.purpose}
            onChange={onChange}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        <button className="btn disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : id ? 'Update' : 'Save'}
        </button>
      </form>
    </div>
  )
}
