import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  roomNumber: '',
  startDate: '',
  endDate: '',
  purpose: ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // If an id exists, we are editing an existing booking.
  // Load the booking and fill the form with its data.
  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      try {
        const res = await api.get('/bookings/' + id)
        const booking = res.data.booking

        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: booking.startDate
            ? booking.startDate.slice(0, 10)
            : '',
          endDate: booking.endDate
            ? booking.endDate.slice(0, 10)
            : '',
          purpose: booking.purpose || ''
        })
      } catch (err) {
        setError(
          err?.response?.data?.message || 'Failed to load booking'
        )
      }
    }

    loadBooking()
  }, [id])

  // Update the form whenever an input changes.
  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Create a new booking or update an existing booking.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const bookingData = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }

    try {
      if (id) {
        await api.patch('/bookings/' + id, bookingData)
      } else {
        await api.post('/bookings', bookingData)
      }

      nav('/bookings')
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Booking failed'
      )
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Booking
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">

        {/* Room Number */}
        <label className="block">
          <span className="text-sm font-medium">
            Room Number
          </span>

          <input
            className="input"
            type="text"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="e.g. B2-104"
            required
          />
        </label>

        {/* Start Date */}
        <label className="block">
          <span className="text-sm font-medium">
            Start Date
          </span>

          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        {/* End Date */}
        <label className="block">
          <span className="text-sm font-medium">
            End Date
          </span>

          <input
            className="input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        {/* Purpose */}
        <label className="block">
          <span className="text-sm font-medium">
            Purpose
          </span>

          <textarea
            className="input"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Optional"
            rows="3"
          />
        </label>

        {/* Server error */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          className="btn"
          type="submit"
        >
          Save
        </button>

      </form>
    </div>
  )
}