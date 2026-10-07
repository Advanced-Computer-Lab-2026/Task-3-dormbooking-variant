import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Book a Room page — routed at /bookings/new (book) and /bookings/:id (edit),
// both wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// The server sends dates as ISO strings ("2026-10-10T00:00:00.000Z"), but a
// date input only accepts "YYYY-MM-DD". "YYYY-MM-DD" from the input is stored
// as UTC midnight, so the first 10 characters are the original date.
function toDateInput(iso) {
  return iso ? iso.slice(0, 10) : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the booking and fill the form.
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      return
    }
    let ignore = false
    api.get('/bookings/' + id)
      .then(res => {
        if (ignore) return
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || ''
        })
      })
      .catch(err => {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load booking')
      })
    return () => { ignore = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // Only send these fields — never bookedBy, the server takes it from the token.
    const { roomNumber, startDate, endDate, purpose } = form
    const body = { roomNumber, startDate, endDate, purpose }
    try {
      if (id) await api.patch('/bookings/' + id, body)
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
        <input className="input" name="roomNumber" placeholder="Room number (e.g. B2-104)" value={form.roomNumber} onChange={onChange} required />
        <label className="block text-sm">
          Start date
          <input className="input mt-1" type="date" name="startDate" value={form.startDate} onChange={onChange} required />
        </label>
        <label className="block text-sm">
          End date
          <input className="input mt-1" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
        </label>
        <textarea className="input" name="purpose" placeholder="Purpose (optional)" rows={3} value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
