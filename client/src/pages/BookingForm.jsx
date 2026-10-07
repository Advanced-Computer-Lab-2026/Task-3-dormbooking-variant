import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function toDateInput(iso) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // When editing an existing booking, load its data and prefill the form
  useEffect(() => {
    if (!id) return
    async function loadBooking() {
      try {
        const res = await api.get('/bookings/' + id)
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load booking')
      }
    }
    loadBooking()
  }, [id])

  // Update form state when an input field changes
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // POST a new booking or PATCH the existing one, then navigate back to /bookings
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      }

      if (id) {
        await api.patch('/bookings/' + id, payload)
      } else {
        await api.post('/bookings', payload)
      }

      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save booking')
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
          <label className="block text-sm text-zinc-600 mb-1">Start date</label>
          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 mb-1">End date</label>
          <input
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
          rows="3"
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
