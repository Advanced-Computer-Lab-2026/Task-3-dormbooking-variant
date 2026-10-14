
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  roomNumber: '',
  startDate: '',
  endDate: '',
  purpose: '',
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load an existing booking when editing.
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setError('')
      return
    }

    async function loadBooking() {
      try {
        setError('')
        setLoading(true)

        const response = await api.get(`/bookings/${id}`)
        const booking = response.data.booking ?? response.data

        setForm({
          roomNumber: booking.roomNumber ?? '',
          startDate: booking.startDate
            ? booking.startDate.slice(0, 10)
            : '',
          endDate: booking.endDate
            ? booking.endDate.slice(0, 10)
            : '',
          purpose: booking.purpose ?? '',
        })
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Could not load the booking. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [id])

  // Update the form when an input changes.
  function onChange(e) {
    const { name, value } = e.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  // Create a booking or edit an existing booking.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
      }

      nav('/bookings')
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message || ''
      const lowerMessage = message.toLowerCase()

      if (
        status === 400 &&
        (lowerMessage.includes('enddate') ||
          lowerMessage.includes('startdate'))
      ) {
        setError(
          'End date must be after the start date. Please choose a later date.'
        )
      } else if (status === 409) {
        setError(
          'This room is already booked for those dates. Please choose another room or date.'
        )
      } else if (status === 403) {
        setError(
          'You do not have permission to edit this booking.'
        )
      } else if (status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        )
      } else {
        setError(
          message || 'Could not save the booking. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Booking
      </h1>

      {loading && id && (
        <p className="text-sm mb-3">Loading booking...</p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="roomNumber" className="block mb-1">
            Room number
          </label>
          <input
            id="roomNumber"
            name="roomNumber"
            type="text"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="e.g. B2-104"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block mb-1">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block mb-1">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="purpose" className="block mb-1">
            Purpose (optional)
          </label>
          <textarea
            id="purpose"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Why do you need the room?"
            rows={3}
            className="w-full"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        <button
          className="btn"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
