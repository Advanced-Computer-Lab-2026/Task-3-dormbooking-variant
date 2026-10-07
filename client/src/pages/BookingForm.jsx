import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Book a Room page — see README.md "Your task".
// This page is already routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function formatDateInput(value) {
  return value ? value.slice(0, 10) : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [loaded, setLoaded] = useState(!id)

  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      setLoading(true)
      setLoaded(false)
      setError('')
      try {
        const res = await api.get(`/bookings/${id}`)
        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber,
          startDate: formatDateInput(booking.startDate),
          endDate: formatDateInput(booking.endDate),
          purpose: booking.purpose || ''
        })
        setLoaded(true)
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load booking')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { roomNumber, startDate, endDate, purpose } = form
      const booking = { roomNumber, startDate, endDate, purpose }
      if (id) {
        await api.patch(`/bookings/${id}`, booking)
      } else {
        await api.post('/bookings', booking)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      {loading ? (
        <div className="text-sm text-zinc-600">Loading booking...</div>
      ) : id && !loaded ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm font-medium">
            Room number
            <input
              className="input mt-1"
              type="text"
              name="roomNumber"
              value={form.roomNumber}
              onChange={onChange}
              placeholder="B2-104"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Start date
            <input
              className="input mt-1"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            End date
            <input
              className="input mt-1"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Purpose
            <textarea
              className="input mt-1"
              name="purpose"
              value={form.purpose}
              onChange={onChange}
              rows="3"
            />
          </label>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="btn" type="submit">Save</button>
        </form>
      )}
    </div>
  )
}
