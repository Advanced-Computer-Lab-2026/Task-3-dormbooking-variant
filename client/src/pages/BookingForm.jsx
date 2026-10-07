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

  // If there is an id in the URL, we are editing an existing booking.
  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${id}`)
        const booking = res.data

        setForm({
          roomNumber: booking.roomNumber,
          startDate: booking.startDate.slice(0, 10),
          endDate: booking.endDate.slice(0, 10),
          purpose: booking.purpose || ''
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking')
      }
    }

    loadBooking()
  }, [id])

  // Update the correct property in form whenever an input changes.
  function onChange(e) {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value
    })
  }

  // Create a new booking or update an existing booking.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const data = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      }

      if (id) {
        await api.patch(`/bookings/${id}`, data)
      } else {
        await api.post('/bookings', data)
      }

      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Booking
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Room Number
          </label>

          <input
            className="input"
            type="text"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Start Date
          </label>

          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            End Date
          </label>

          <input
            className="input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Purpose
          </label>

          <textarea
            className="input"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Optional"
          />
        </div>

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