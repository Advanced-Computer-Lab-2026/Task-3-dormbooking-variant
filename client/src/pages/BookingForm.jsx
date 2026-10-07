import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Book a Room page — see README.md "Your task".
// This page is already routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: when there is an `id`, load the booking and fill the form.
  useEffect(() => {
    if (!id) return
    let cancelled = false
    api.get('/bookings/' + id)
      .then(res => {
        if (cancelled) return
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          // ISO "2026-10-10T00:00:00.000Z" -> "2026-10-10" for <input type="date">
          startDate: b.startDate.slice(0, 10),
          endDate: b.endDate.slice(0, 10),
          purpose: b.purpose || ''
        })
      })
      .catch(err => {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load the booking')
      })
    return () => { cancelled = true }
  }, [id])

  // One handler for all four inputs: `name` tells us which field changed.
  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // POST a new booking, or PATCH the existing one when editing.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { roomNumber, startDate, endDate, purpose } = form
      const body = { roomNumber, startDate, endDate, purpose }
      if (id) await api.patch('/bookings/' + id, body)
      else await api.post('/bookings', body)
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the booking')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="roomNumber" className="block text-sm mb-1">Room number</label>
          <input
            id="roomNumber"
            name="roomNumber"
            type="text"
            placeholder="B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm mb-1">Start date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm mb-1">End date</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="purpose" className="block text-sm mb-1">Purpose (optional)</label>
          <textarea
            id="purpose"
            name="purpose"
            rows={3}
            value={form.purpose}
            onChange={onChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
