import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// The server sends "2026-10-10T00:00:00.000Z"; <input type="date"> only accepts "YYYY-MM-DD".
// The first 10 characters of the ISO string are exactly that (and avoid timezone shifts
// you'd get from new Date(...).toLocaleDateString()).
const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : '')

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the booking and fill the form.
  useEffect(() => {
    if (!id) {
      setForm(defaults) // navigating from /bookings/:id to /bookings/new must clear the form
      return
    }
    let cancelled = false // ignore a late response if the user left the page / changed id
    setError('')
    api.get('/bookings/' + id)
      .then(res => {
        if (cancelled) return
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || ''
        })
      })
      .catch(err => {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load booking')
      })
    return () => { cancelled = true }
  }, [id])

  // One handler for every input: the input's `name` matches a key in `form`.
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault() // stop the browser's full-page form submit
    setError('')
    try {
      // Never send bookedBy — the server takes it from the token and rejects it otherwise.
      const payload = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      }
      if (id) await api.patch('/bookings/' + id, payload)
      else await api.post('/bookings', payload)
      nav('/bookings')
    } catch (err) {
      // 400 (bad dates), 403 (not yours), 409 (room taken) all carry { message }
      setError(err?.response?.data?.message || 'Could not save booking')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="roomNumber" className="block text-sm font-medium mb-1">Room number</label>
          <input
            id="roomNumber"
            name="roomNumber"
            className="input"
            placeholder="e.g. B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start date</label>
            <input id="startDate" name="startDate" type="date" className="input"
              value={form.startDate} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">End date</label>
            <input id="endDate" name="endDate" type="date" className="input"
              value={form.endDate} onChange={onChange} required />
          </div>
        </div>
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium mb-1">Purpose (optional)</label>
          <textarea
            id="purpose"
            name="purpose"
            rows={3}
            className="input"
            value={form.purpose}
            onChange={onChange}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
