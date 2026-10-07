import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function dateInputValue(value) {
  return value ? value.slice(0, 10) : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError('')

    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${id}`)
        const booking = res.data.booking
        if (active) {
          setForm({
            roomNumber: booking.roomNumber || '',
            startDate: dateInputValue(booking.startDate),
            endDate: dateInputValue(booking.endDate),
            purpose: booking.purpose || '',
          })
        }
      } catch (err) {
        if (active) setError(err?.response?.data?.message || 'Could not load booking')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBooking()
    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose,
    }

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save booking')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Room number</span>
          <input
            className="input"
            type="text"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Start date</span>
          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">End date</span>
          <input
            className="input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Purpose (optional)</span>
          <textarea
            className="input"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            rows={3}
          />
        </label>

        {error && <div role="alert" className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Loading…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
