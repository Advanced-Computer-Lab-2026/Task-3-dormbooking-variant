import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

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
      try {
        const res = await api.get(`/bookings/${id}`)

        // Some APIs return { booking: { ... } }, others return the object directly.
        // We handle both cases here.
        const b = res.data.booking || res.data

        if (!b || Object.keys(b).length === 0) {
          throw new Error('Booking not found or empty data received')
        }

        const formatDate = (dateStr) => {
          if (!dateStr) return ''
          // Handles ISO strings and simple date strings
          return dateStr.split('T')[0]
        }

        setForm({
          roomNumber: b.roomNumber || '',
          startDate: formatDate(b.startDate),
          endDate: formatDate(b.endDate),
          purpose: b.purpose || '',
        })
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load booking')
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

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto card flex items-center justify-center py-10">
        <p className="text-gray-500 animate-pulse">Loading booking details...</p>
      </div>
    )
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
            value={form.roomNumber}
            onChange={onChange}
            className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
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
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        {error && <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">{error}</div>}

        <button className="btn w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" type="submit">
          Save Booking
        </button>
      </form>
    </div>
  )
}
