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

  // Load an existing booking when editing
  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      try {
        const res = await api.get('/bookings/' + id)
        const booking = res.data.booking

        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: booking.startDate
            ? booking.startDate.split('T')[0]
            : '',
          endDate: booking.endDate
            ? booking.endDate.split('T')[0]
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

  // Update the corresponding form field
  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Create or update the booking
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch('/bookings/' + id, form)
      } else {
        await api.post('/bookings', form)
      }

      nav('/bookings')
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to save booking'
      )
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
            placeholder="e.g. B2-104"
            value={form.roomNumber}
            onChange={onChange}
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
            placeholder="Purpose (optional)"
            value={form.purpose}
            onChange={onChange}
            rows="4"
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