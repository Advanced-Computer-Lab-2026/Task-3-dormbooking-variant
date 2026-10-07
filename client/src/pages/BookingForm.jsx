import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${id}`)
        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber,
          startDate: booking.startDate.split('T')[0],
          endDate: booking.endDate.split('T')[0],
          purpose: booking.purpose || '',
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking')
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
    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
      }
      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Room Number</label>
          <input
            className="input"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="e.g. B2-104"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
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
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              className="input"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Purpose (Optional)</label>
          <textarea
            className="input"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            rows="3"
          />
        </div>
        {error && <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
