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
    api.get(`/bookings/${id}`)
      .then(res => {
        const b = res.data.booking
        // date inputs only accept YYYY-MM-DD, the server sends full ISO strings
        setForm({
          roomNumber: b.roomNumber,
          startDate: b.startDate.slice(0, 10),
          endDate: b.endDate.slice(0, 10),
          purpose: b.purpose || ''
        })
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load booking'))
  }, [id])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // bookedBy is never sent — the server takes it from the token
    const { roomNumber, startDate, endDate, purpose } = form
    const body = { roomNumber, startDate, endDate, purpose }
    try {
      if (id) await api.patch(`/bookings/${id}`, body)
      else await api.post('/bookings', body)
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
          Start date
          <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </label>
        <label className="block">
          End date
          <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </label>
        <textarea className="input" name="purpose" placeholder="Purpose (optional)" value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
