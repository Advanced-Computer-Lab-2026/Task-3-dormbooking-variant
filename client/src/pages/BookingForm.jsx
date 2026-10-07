import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Book a Room page — see README.md "Your task".
// This page is already routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO (edit mode): when there is an `id`, load the booking and fill the form.
  useEffect(() => {
    if (!id) return
    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${id}`)
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: b.startDate.split('T')[0],
          endDate: b.endDate.split('T')[0],
          purpose: b.purpose || '',
        })
      } catch (err) {
        console.error('Error loading booking:', err);
        setError(err.response?.data?.message || 'Failed to load booking')
      }
    }
    loadBooking()
  }, [id])

  // TODO: update `form` when an input changes.
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // TODO: POST a new booking, or PATCH the existing one when editing,
  // then go back to /bookings. Show the server's error message on failure.
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
          <label className="block text-sm font-medium text-gray-700">Room Number</label>
          <input
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
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={onChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={onChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Purpose (Optional)</label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" type="submit">
          Save Booking
        </button>
      </form>
    </div>
  )
}
