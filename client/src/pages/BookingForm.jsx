import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// The Book a Room page. Routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// The server sends "2026-10-10T00:00:00.000Z", but <input type="date"> only accepts "2026-10-10"
function toDateInput(d) {
  return d ? d.slice(0, 10) : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the booking and fill the form with it
  // (/bookings/:id -> /bookings/new reuses this component, so reset form and error first)
  useEffect(() => {
    setError('')
    if (!id) {
      setForm(defaults)
      return
    }
    // ignore a response that arrives after the id changed or the page was left
    let ignore = false
    async function load() {
      try {
        const res = await api.get('/bookings/' + id)
        if (ignore) return
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || ''
        })
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Could not load booking')
      }
    }
    load()
    return () => { ignore = true }
  }, [id])

  // Every input has a `name` matching a key in `form`, so one handler covers them all
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // bookedBy is never sent: the server takes the booker from the token
    const body = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }
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
        <input className="input" name="roomNumber" placeholder="Room number (e.g. B2-104)" value={form.roomNumber} onChange={onChange} />
        <label className="block text-sm">
          Start date
          <input className="input mt-1" type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </label>
        <label className="block text-sm">
          End date
          <input className="input mt-1" type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </label>
        <textarea className="input" name="purpose" rows={3} placeholder="Purpose (optional)" value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
