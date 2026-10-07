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

  useEffect(() => {
    if (!id) return

    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        const booking = data.booking

        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: booking.startDate
            ? booking.startDate.slice(0, 10)
            : '',
          endDate: booking.endDate
            ? booking.endDate.slice(0, 10)
            : '',
          purpose: booking.purpose || '',
        })
      } catch (err) {
        setError(
          err.response?.data?.message || err.message
        )
      }
    }

    loadBooking()
  }, [id])

  function onChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
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
        err.response?.data?.message || err.message
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
          value={form.roomNumber}
          onChange={onChange}
          placeholder="Room number (e.g. B2-104)"
          required
        />

        <input
          className="input"
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={onChange}
          required
        />

        <input
          className="input"
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={onChange}
          required
        />

        <textarea
          className="input"
          name="purpose"
          value={form.purpose}
          onChange={onChange}
          placeholder="Purpose (optional)"
          rows="4"
        />

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