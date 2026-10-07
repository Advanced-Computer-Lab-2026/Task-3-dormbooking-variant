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
    let ignore = false
    setError('')
    setForm(defaults)

    if (!id) return

    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)

        if (ignore) return

        setForm({
          roomNumber: data.booking.roomNumber,
          startDate: data.booking.startDate.slice(0, 10),
          endDate: data.booking.endDate.slice(0, 10),
          purpose: data.booking.purpose ?? ''
        })
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || 'Failed to load booking'
          )
        }
      }
    }

    loadBooking()

    return () => {
      ignore = true
    }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const payload = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      }

      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }

      nav('/bookings')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save booking'
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
          <label htmlFor="roomNumber">Room number</label>
          <input
            id="roomNumber"
            name="roomNumber"
            type="text"
            placeholder="B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="startDate">Start date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="endDate">End date</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="purpose">Purpose (optional)</label>
          <textarea
            id="purpose"
            name="purpose"
            placeholder="What is the booking for?"
            value={form.purpose}
            onChange={onChange}
            rows={3}
          />
        </div>

        {error && (
          <div role="alert" className="text-red-600 text-sm">
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