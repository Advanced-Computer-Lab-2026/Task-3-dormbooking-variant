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

  // Edit mode: load the existing booking and fill the form.
  useEffect(() => {
  if (!id) return

  async function loadBooking() {
    try {
      const response = await api.get(`/bookings/${id}`)
      const booking = response.data.booking

      setForm({
        roomNumber: booking.roomNumber || '',
        startDate: booking.startDate
          ? booking.startDate.slice(0, 10)
          : '',
        endDate: booking.endDate
          ? booking.endDate.slice(0, 10)
          : '',
        purpose: booking.purpose || '',
      })
    } catch (err) {
      setError(err.message)
    }
  }

  loadBooking()
}, [id])
  // Update the correct form field whenever an input changes.
  function onChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Create a new booking or update an existing booking.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, {
          roomNumber: form.roomNumber,
          startDate: form.startDate,
          endDate: form.endDate,
          purpose: form.purpose,
        })
      } else {
        await api.post('/bookings', {
          roomNumber: form.roomNumber,
          startDate: form.startDate,
          endDate: form.endDate,
          purpose: form.purpose,
        })
      }

      nav('/bookings')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Booking
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="roomNumber"
          value={form.roomNumber}
          onChange={onChange}
          placeholder="Room number (e.g. B2-104)"
          required
        />

        <input
          className="input"
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={onChange}
          required
        />

        <input
          className="input"
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={onChange}
          required
        />

        <textarea
          className="input"
          name="purpose"
          value={form.purpose}
          onChange={onChange}
          placeholder="Purpose (optional)"
          rows="4"
        />

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  )
}