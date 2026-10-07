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
        const res = await api.get(`/bookings/${id}`)
        const booking = res.data.booking || res.data

        setForm({
          roomNumber: booking.roomNumber || '',
          startDate: booking.startDate
            ? new Date(booking.startDate).toISOString().slice(0, 10)
            : '',
          endDate: booking.endDate
            ? new Date(booking.endDate).toISOString().slice(0, 10)
            : '',
          purpose: booking.purpose || ''
        })
      } catch (err) {
        setError(
          err?.response?.data?.message || 'Failed to load booking'
        )
      }
    }

    loadBooking()
  }, [id])


  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const bookingData = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      }

      if (id) {
        await api.patch(`/bookings/${id}`, bookingData)
      } else {
        await api.post('/bookings', bookingData)
      }

      nav('/bookings')
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to save booking'
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
          name="roomNumber"
          value={form.roomNumber}
          onChange={onChange}
          placeholder="e.g. B3-102"
          pattern="[A-Za-z]+[0-9]+-[0-9]{3}"
          title="Room number must be in the format B3-102"
          required
          className="input"
        />

        <div>
          <label className="block text-sm mb-1">Start date</label>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            min="2026-01-01"
            max="2027-12-31"
            required
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">End date</label>
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            min="2026-01-01"
            max="2027-12-31"
            required
            className="input"
          />
        </div>

        <textarea
          name="purpose"
          value={form.purpose}
          onChange={onChange}
          placeholder="Purpose"
          className="input min-h-24"
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