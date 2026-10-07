import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [submitting, setSubmitting] = useState(false)

  // Edit mode: load the booking and fill the form with it.
  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get('/bookings/' + id)
      .then(res => {
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          // date inputs only accept YYYY-MM-DD, the server sends full ISO strings
          startDate: b.startDate.slice(0, 10),
          endDate: b.endDate.slice(0, 10),
          purpose: b.purpose ?? ''
        })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load booking'))
      .finally(() => setLoading(false))
  }, [id])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { roomNumber, startDate, endDate, purpose } = form
    const body = { roomNumber, startDate, endDate, purpose }
    try {
      if (id) await api.patch('/bookings/' + id, body)
      else await api.post('/bookings', body)
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Saving the booking failed')
      setSubmitting(false)
    }
  }

  if (loading) return <div className="max-w-lg mx-auto card">Loading booking...</div>

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit Booking' : 'Book a Room'}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" name="roomNumber" placeholder="Room number (e.g. B2-104)" value={form.roomNumber} onChange={onChange} />
        <label className="block">
          Start date
          <input className="input mt-1" type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </label>
        <label className="block">
          End date
          <input className="input mt-1" type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </label>
        <textarea className="input" name="purpose" rows={3} placeholder="Purpose (optional)" value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn disabled:opacity-50" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
