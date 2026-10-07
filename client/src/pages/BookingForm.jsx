import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function toDateInputValue(date) {
  return date ? date.split('T')[0] : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    async function loadBooking() {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/bookings/${id}`)
        const booking = data.booking
        setForm({
          roomNumber: booking.roomNumber,
          startDate: toDateInputValue(booking.startDate),
          endDate: toDateInputValue(booking.endDate),
          purpose: booking.purpose || '',
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking')
      } finally {
        setIsLoading(false)
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
      purpose: form.purpose,
    }
    try {
      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      {isLoading ? (
        <div className="text-center py-10">Loading booking details...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={form.roomNumber}
              onChange={onChange}
              className="input w-full"
              placeholder="e.g. B2-104"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={onChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={onChange}
                className="input w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purpose (Optional)</label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={onChange}
              className="input w-full h-24"
              placeholder="Reason for booking..."
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="btn w-full" type="submit">Save</button>
        </form>
      )}
    </div>
  )
}
