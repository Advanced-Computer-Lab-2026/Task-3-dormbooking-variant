import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Booking form for creating and editing bookings

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

  // Convert server date:
  // 2026-10-10T00:00:00.000Z
  // into:
  // 2026-10-10
  function formatDate(date) {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  // If there is an ID, load the existing booking
  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      try {
        const response = await api.get(`/bookings/${id}`)
        const booking = response.data.booking

        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: formatDate(booking.startDate),
          endDate: formatDate(booking.endDate),
          purpose: booking.purpose || ''
        })
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load booking'
        )
      }
    }

    loadBooking()
  }, [id])

  // Update form when the user types/selects something
  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Create a new booking or edit an existing booking
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const bookingData = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      }

      if (id) {
        // Edit existing booking
        await api.patch(`/bookings/${id}`, bookingData)
      } else {
        // Create new booking
        await api.post('/bookings', bookingData)
      }

      // Go back to bookings after successful save
      nav('/bookings')
    } catch (err) {
      // Show the server's error message
      setError(
        err.response?.data?.message || 'Something went wrong'
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
        <div>
          <label className="block mb-1">
            Room Number
          </label>

          <input
            type="text"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
            required
            className="w-full"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block mb-1">
            Start Date
          </label>

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
            className="w-full"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block mb-1">
            End Date
          </label>

          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
            className="w-full"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="block mb-1">
            Purpose
          </label>

          <textarea
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Group study for the ACL milestone"
            className="w-full"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Save */}
        <button className="btn" type="submit">
          Save
        </button>

      </form>
    </div>
  )
}
