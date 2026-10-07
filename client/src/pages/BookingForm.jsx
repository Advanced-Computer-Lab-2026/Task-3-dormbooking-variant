import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

function dateForInput(date) {
  return date ? date.slice(0, 10) : ''
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

    setLoading(true)
    setError('')
    api.get('/bookings/' + id)
      .then(res => {
        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: dateForInput(booking.startDate),
          endDate: dateForInput(booking.endDate),
          purpose: booking.purpose || ''
        })
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to load booking')
      })
      .finally(() => setLoading(false))
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
        await api.patch('/bookings/' + id, payload)
      } else {
        await api.post('/bookings', payload)
      }

      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking failed')
    }
  }

  if (loading) return <div className="text-sm text-zinc-600">Loading booking...</div>

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Editing a Booking' : 'Booking a Room'}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium">
          Room number
          <input
            className="input mt-1"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Start date
          <input
            className="input mt-1"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          End date
          <input
            className="input mt-1"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Purpose (optional)
          <textarea
            className="input mt-1"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            rows="3"
          />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">{id ? 'Update Booking' : 'Book Room'}</button>
      </form>
    </div>
  )
}
