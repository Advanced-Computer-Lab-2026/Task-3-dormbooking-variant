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
  api.get(`/bookings/${id}`)
    .then(({ data }) => {
      const b = data.booking
      setForm({
        roomNumber: b.roomNumber,
        startDate: b.startDate.slice(0, 10),
        endDate: b.endDate.slice(0, 10),
        purpose: b.purpose || '',
      })
    })
    .catch((err) => {
      setError(err.response?.data?.message || 'Could not load booking')
    })
}, [id])

  // TODO: update `form` when an input changes.
  function onChange(e) {
  const { name, value } = e.target
  setForm((prev) => ({ ...prev, [name]: value }))
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
  <div>
    <label className="block text-sm mb-1" htmlFor="roomNumber">Room number</label>
    <input
      id="roomNumber"
      name="roomNumber"
      type="text"
      className="input"
      placeholder="B2-104"
      value={form.roomNumber}
      onChange={onChange}
      required
    />
  </div>

  <div>
    <label className="block text-sm mb-1" htmlFor="startDate">Start date</label>
    <input
      id="startDate"
      name="startDate"
      type="date"
      className="input"
      value={form.startDate}
      onChange={onChange}
      required
    />
  </div>

  <div>
    <label className="block text-sm mb-1" htmlFor="endDate">End date</label>
    <input
      id="endDate"
      name="endDate"
      type="date"
      className="input"
      value={form.endDate}
      onChange={onChange}
      required
    />
  </div>

  <div>
    <label className="block text-sm mb-1" htmlFor="purpose">Purpose (optional)</label>
    <textarea
      id="purpose"
      name="purpose"
      rows={3}
      className="input"
      value={form.purpose}
      onChange={onChange}
    />
  </div>

  {error && <div className="text-red-600 text-sm">{error}</div>}
  <button className="btn" type="submit">Save</button>
</form>
    </div>
  )
}
