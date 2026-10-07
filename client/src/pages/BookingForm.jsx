import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toISOString().slice(0, 10)
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
        const res = await api.get(`/bookings/${id}`)
        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: toDateInputValue(booking.startDate),
          endDate: toDateInputValue(booking.endDate),
          purpose: booking.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Booking could not be loaded')
      }
    }

    loadBooking()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      roomNumber: form.roomNumber.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Room number</span>
          <input
            className="input mt-1"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Start date</span>
            <input
              className="input mt-1"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">End date</span>
            <input
              className="input mt-1"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Purpose</span>
          <textarea
            className="input mt-1"
            rows="4"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Optional"
          />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
