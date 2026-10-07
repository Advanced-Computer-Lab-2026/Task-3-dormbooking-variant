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
    if (!id) {
      setForm(defaults)
      return
    }

    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${id}`)
        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: booking.startDate ? booking.startDate.slice(0, 10) : '',
          endDate: booking.endDate ? booking.endDate.slice(0, 10) : '',
          purpose: booking.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load booking')
      }
    }

    loadBooking()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
        <div className="space-y-1">
          <label className="block text-sm font-medium">Room number</label>
          <input
            className="input"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Start date</label>
            <input
              className="input"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">End date</label>
            <input
              className="input"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Purpose</label>
          <textarea
            className="input min-h-[100px]"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Optional purpose for the room"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
