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

  // Edit mode: load the booking and fill the form.
  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await api.get('/bookings/' + id)
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          // Server sends "2026-10-10T00:00:00.000Z"; date inputs need "2026-10-10"
          startDate: b.startDate.slice(0, 10),
          endDate: b.endDate.slice(0, 10),
          purpose: b.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load booking')
      }
    }
    load()
  }, [id])

  // Each input's `name` matches a key in `form`, so one handler covers them all.
  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // POST a new booking, or PATCH the existing one when editing.
  // `form` has no bookedBy — the server takes the booker from the token.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) await api.patch('/bookings/' + id, form)
      else await api.post('/bookings', form)
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" name="roomNumber" placeholder="Room number (e.g. B2-104)" value={form.roomNumber} onChange={onChange} />
        <label className="block">
          <span className="block text-sm mb-1">Start date</span>
          <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </label>
        <label className="block">
          <span className="block text-sm mb-1">End date</span>
          <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </label>
        <textarea className="input" name="purpose" placeholder="Purpose (optional)" rows={3} value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
