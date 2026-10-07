import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the booking and fill the form
  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await api.get('/bookings/' + id)
        const b = res.data.booking || res.data
        setForm({
          roomNumber: b.roomNumber,
          startDate: b.startDate.slice(0, 10), // ISO -> YYYY-MM-DD
          endDate: b.endDate.slice(0, 10),
          purpose: b.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load booking')
      }
    }
    load()
  }, [id])

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const body = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      } // no bookedBy: the server takes it from the token
      if (id) await api.patch('/bookings/' + id, body)
      else await api.post('/bookings', body)
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  const input = 'w-full border rounded px-3 py-2'

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className={input}
          name="roomNumber"
          placeholder="Room number (e.g. B2-104)"
          value={form.roomNumber}
          onChange={onChange}
          required
        />
        <input
          className={input}
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={onChange}
          required
        />
        <input
          className={input}
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={onChange}
          required
        />
        <textarea
          className={input}
          name="purpose"
          placeholder="Purpose (optional)"
          value={form.purpose}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
