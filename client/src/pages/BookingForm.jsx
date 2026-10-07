import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

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
        const { booking } = res.data
        setForm({
          roomNumber: booking.roomNumber,
          startDate: booking.startDate.split('T')[0],
          endDate: booking.endDate.split('T')[0],
          purpose: booking.purpose || '',
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking')
      }
    }
    loadBooking()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(current => ({ ...current, [name]: value }))
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { roomNumber, startDate, endDate, purpose } = form
      const booking = { roomNumber, startDate, endDate, purpose }
      if (id) {
        await api.patch(`/bookings/${id}`, booking)
      } else {
        await api.post('/bookings', booking)
      }
      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred')
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
            placeholder="e.g. B2-104"
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
          <span className="text-sm font-medium">Purpose <span className="font-normal text-zinc-500">(optional)</span></span>
          <textarea
            className="input min-h-24 resize-y"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            rows={3}
          />
        </label>
        {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
