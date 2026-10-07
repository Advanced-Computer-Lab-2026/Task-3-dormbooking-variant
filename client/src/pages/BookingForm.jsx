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
      const booking = res.data.booking


      setForm({
        roomNumber: booking.roomNumber || '',
        startDate: booking.startDate?.slice(0, 10) || '',
        endDate: booking.endDate?.slice(0, 10) || '',
        purpose: booking.purpose || ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking')
    }
  }

  loadBooking()
}, [id])

  // TODO: update `form` when an input changes.
  function onChange(e) {
  const { name, value } = e.target
  setForm({ ...form, [name]: value })
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
    setError(err.response?.data?.message || 'Something went wrong')
  }
}

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
  className="input"
  type="text"
  name="roomNumber"
  placeholder="Room number"
  value={form.roomNumber}
  onChange={onChange}
/>

<div>
  <label className="block text-sm mb-1">Start date</label>
  <input
    className="input"
    type="date"
    name="startDate"
    value={form.startDate}
    onChange={onChange}
  />
</div>

<div>
  <label className="block text-sm mb-1">End date</label>
  <input
    className="input"
    type="date"
    name="endDate"
    value={form.endDate}
    onChange={onChange}
  />
</div>

<textarea
  className="input"
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
