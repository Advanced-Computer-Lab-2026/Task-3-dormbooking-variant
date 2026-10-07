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
    api.get('/bookings/' + id)
      .then(res => {
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          // the server sends full ISO strings; a date input only accepts YYYY-MM-DD
          startDate: b.startDate.slice(0, 10),
          endDate: b.endDate.slice(0, 10),
          purpose: b.purpose ?? ''
        })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load booking'))
  }, [id])

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // only these fields — the server takes bookedBy from the token and rejects it in the body
    const { roomNumber, startDate, endDate, purpose } = form
    const payload = { roomNumber, startDate, endDate, purpose }
    try {
      if (id) await api.patch('/bookings/' + id, payload)
      else await api.post('/bookings', payload)
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
        <div>
          <label htmlFor="startDate" className="text-sm">Start date</label>
          <input className="input" id="startDate" name="startDate" type="date" value={form.startDate} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="endDate" className="text-sm">End date</label>
          <input className="input" id="endDate" name="endDate" type="date" value={form.endDate} onChange={onChange} />
        </div>
        <textarea className="input" name="purpose" rows={3} placeholder="Purpose (optional)" value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
