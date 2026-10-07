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
    
    async function loadBooking(){
      try{
        const {data} = await api.get('/bookings/${id}')

        setForm({
          roomNumber: data.roomNumber,
          startDate: data.startDate.slice(0,10),
          endDate: data.endDate.slice(0,10),
          purpose: data.purpose || '',
        })
      } catch (err){
        setError(err.response?.data?.message || 'Failed to load booking')
      }
    }

    loadBooking()
  }, [id])

  // TODO: update `form` when an input changes.
  function onChange(e) {
    const {name, value} = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // TODO: POST a new booking, or PATCH the existing one when editing,
  // then go back to /bookings. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    
    try{
      const bookingData = {
          roomNumber: form.roomNumber,
          startDate: form.startDate,
          endDate: form.endDate,
          purpose: form.purpose,
      }

      if (id) {
        await api.patch('/bookings/${id}', bookingData)
      } else {
        await api.post('/bookings', bookingData)
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
            <label htmlFor="roomNumber" className="block text-sm font-medium">
              Room Number
            </label>
            <input
              id="roomNumber"
              name="roomNumber"
              type="text"
              value={form.roomNumber}
              onChange={onChange}
              placeholder="e.g. B2-104"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={onChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={onChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium">
              Purpose
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={onChange}
              placeholder="Optional"
              className="input"
            />
          </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
