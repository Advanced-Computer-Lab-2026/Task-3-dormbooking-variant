import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setError('')
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadBooking() {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/bookings/${id}`)
        const booking = response.data.booking

        if (!cancelled) {
          setForm({
            roomNumber: booking.roomNumber || '',
            startDate: booking.startDate ? booking.startDate.slice(0, 10) : '',
            endDate: booking.endDate ? booking.endDate.slice(0, 10) : '',
            purpose: booking.purpose || '',
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load booking')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBooking()
    return () => {
      cancelled = true
    }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(previousForm => ({ ...previousForm, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const bookingData = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose,
    }

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, bookingData)
      } else {
        await api.post('/bookings', bookingData)
      }

      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save booking')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="max-w-lg mx-auto card">Loading booking...</div>
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="roomNumber">Room Number</label>
          <input
            className="input"
            id="roomNumber"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="e.g. B2-104"
            required
          />
        </div>

        <div>
          <label htmlFor="startDate">Start Date</label>
          <input
            className="input"
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="endDate">End Date</label>
          <input
            className="input"
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="purpose">Purpose</label>
          <textarea
            className="input"
            id="purpose"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Optional"
            rows="4"
          />
        </div>

        {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
