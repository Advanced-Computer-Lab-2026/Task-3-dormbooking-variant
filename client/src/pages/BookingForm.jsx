import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/bookings/' + id)
        const booking = res.data

        setForm({
          roomNumber: booking.roomNumber,
          startDate: booking.startDate.split('T')[0],
          endDate: booking.endDate.split('T')[0],
          purpose: booking.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load booking')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

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
      setError(err?.response?.data?.message || 'An error occurred while saving the booking')
    }
  }

  if (loading) {
    return <div className="max-w-lg mx-auto text-center py-10">Loading...</div>
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Room Number</label>
          <input
            type="text"
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
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="input"
              value={form.startDate}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              className="input"
              value={form.endDate}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Purpose (Optional)</label>
          <textarea
            name="purpose"
            className="input"
            rows="3"
            value={form.purpose}
            onChange={onChange}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button className="btn w-full" type="submit">Save Booking</button>
      </form>
    </div>
  )
}
