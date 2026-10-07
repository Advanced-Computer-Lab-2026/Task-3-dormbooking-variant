import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit mode: /bookings/:id. Create mode (/bookings/new) has no id.
  useEffect(() => {
    if (!id) return
    let ignore = false

    async function loadBooking() {
      try {
        const res = await api.get('/bookings/' + id)
        if (ignore) return
        const booking = res.data.booking || {}
        setForm({
          roomNumber: booking.roomNumber || '',
          // Date inputs only accept YYYY-MM-DD. The API sends full ISO strings.
          startDate: booking.startDate?.slice(0, 10) || '',
          endDate: booking.endDate?.slice(0, 10) || '',
          purpose: booking.purpose || ''
        })
      } catch (err) {
        if (ignore) return
        setError(err?.response?.data?.message || 'Failed to load booking')
      }
    }

    loadBooking()
    return () => { ignore = true }
  }, [id])

  function onChange(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    // bookedBy is intentionally omitted. The server sets it from the token.
    const payload = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }

    try {
      if (id) {
        await api.patch('/bookings/' + id, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="roomNumber"
          placeholder="B2-104"
          value={form.roomNumber}
          onChange={onChange}
          required
        />
        <div>
          <label className="block text-sm mb-1" htmlFor="startDate">Start date</label>
          <input
            id="startDate"
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="endDate">End date</label>
          <input
            id="endDate"
            className="input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </div>
        <textarea
          className="input"
          name="purpose"
          placeholder="Purpose (optional)"
          value={form.purpose}
          onChange={onChange}
          rows={3}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit" disabled={saving}>Save</button>
      </form>
    </div>
  )
}
