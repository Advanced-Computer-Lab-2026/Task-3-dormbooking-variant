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
    const response = await api.get(`/bookings/${id}`)
    const booking = response.data.booking

    setForm({
      roomNumber: booking.roomNumber,
      startDate: booking.startDate.slice(0, 10),
      endDate: booking.endDate.slice(0, 10),
      purpose: booking.purpose || '',
    })
  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      'Failed to load booking'
    )
  }
}

  loadBooking()
}, [id])

  // TODO: update `form` when an input changes.
 function onChange(e) {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  })
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
    setError(err.response?.data?.message || 'Failed to save booking')
  }
}

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label>
  Room Number
  <input
    name="roomNumber"
    value={form.roomNumber}
    onChange={onChange}
    type="text"
    className="input"
    placeholder="e.g. B2-104"
    required
  />
</label>

<label>
  Start Date
  <input
    name="startDate"
    value={form.startDate}
    onChange={onChange}
    type="date"
    className="input"
    required
  />
</label>

<label>
  End Date
  <input
    name="endDate"
    value={form.endDate}
    onChange={onChange}
    type="date"
    className="input"
    required
  />
</label>

<label>
  Purpose
  <textarea
    name="purpose"
    value={form.purpose}
    onChange={onChange}
    className="input"
    placeholder="Optional"
  />
</label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
