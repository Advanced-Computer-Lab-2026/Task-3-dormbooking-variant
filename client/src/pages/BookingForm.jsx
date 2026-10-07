import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Book a Room page — routed at /bookings/new (book) and /bookings/:id (edit),
// both wrapped in <ProtectedRoute>.

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
      .catch(err => setError(err?.response?.data?.message || 'Could not load booking'))
  }, [id])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) await api.patch(`/bookings/${id}`, form)
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
        <input className="input" name="roomNumber" placeholder="Room number (e.g. B2-104)"
               value={form.roomNumber} onChange={onChange} required />
        <label className="block text-sm">Start date
          <input className="input" type="date" name="startDate"
                 value={form.startDate} onChange={onChange} required />
        </label>
        <label className="block text-sm">End date
          <input className="input" type="date" name="endDate"
                 value={form.endDate} onChange={onChange} required />
        </label>
        <textarea className="input" name="purpose" placeholder="Purpose (optional)"
                  value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
