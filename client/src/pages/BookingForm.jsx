import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Bookings from './Bookings'

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
  api.get(`/bookings/${id}`).then(({ data }) => {
    const b = data.booking || data.data || data
    console.log('loaded booking:', b)
    setForm({
      roomNumber: b.roomNumber || '',
      startDate: b.startDate ? String(b.startDate).slice(0, 10) : '',
      endDate: b.endDate ? String(b.endDate).slice(0, 10) : '',
      purpose: b.purpose || ''
    })
  }).catch((err) => {
    console.log('load failed:', err)
    setError(err?.response?.data?.message || 'Failed to load booking')
  })
}, [id])

  // TODO: update `form` when an input changes.
  function onChange(e) {
    // TODO
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  }

  // TODO: POST a new booking, or PATCH the existing one when editing,
  // then go back to /bookings. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // TODO
    try {
      const payload = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose,

      }
      if (id) {
        await api.patch(`/bookings/${id}`, payload)


      } else {
        await api.post('/bookings', payload)
      }

      nav('/bookings')
    } catch (err) {


      setError(err?.response?.data?.message || 'Something went wrong')




    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {/* TODO: room number input, start/end date inputs and purpose textarea */}
        <div>
          <label htmlFor="roomNumber" className="block text-sm mb-1">Room number</label>
          <input
            id="roomNumber"
            name="roomNumber"
            type="text"
            placeholder="B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm mb-1">Start date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm mb-1">End date</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="purpose" className="block text-sm mb-1">Purpose (optional)</label>
          <textarea
            id="purpose"
            name="purpose"
            rows={3}
            value={form.purpose}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
