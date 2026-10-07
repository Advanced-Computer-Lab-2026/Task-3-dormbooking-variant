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

  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      try {
        const response = await api.get(`/bookings/${id}`)
        const booking = response.data.booking

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
          err.response?.data?.message ||
          'Failed to load booking'
        )
      }
    }

    loadBooking()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

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
      setError(
        err.response?.data?.message ||
        'Something went wrong'
      )
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Booking
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">

        <input
          className="input"
          name="roomNumber"
          type="text"
          placeholder="Room number"
          value={form.roomNumber}
          onChange={onChange}
          required
        />

        <label className="block">
          <span className="text-sm">Start date</span>

          <input
            className="input"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">End date</span>

          <input
            className="input"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        <textarea
          className="input"
          name="purpose"
          placeholder="Purpose (optional)"
          value={form.purpose}
          onChange={onChange}
          rows="4"
        />

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

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