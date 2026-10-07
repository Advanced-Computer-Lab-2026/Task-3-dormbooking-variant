import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setError('')
      return
    }

    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        const booking = data.booking || {}
        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: toDateInputValue(booking.startDate),
          endDate: toDateInputValue(booking.endDate),
          purpose: booking.purpose || ''
        })
        setError('')
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load booking')
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
        <div>
          <label className="block text-sm mb-1">Room Number</label>
          <input
            className="input"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Start Date</label>
            <input
              className="input"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input
              className="input"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Purpose</label>
          <textarea
            className="input"
            name="purpose"
            rows="4"
            value={form.purpose}
            onChange={onChange}
            placeholder="Optional purpose"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
