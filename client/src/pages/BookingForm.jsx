import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO 3: when there is an id, load the booking and fill the form
  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await api.get(`/bookings/${id}`)
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: b.startDate.slice(0, 10),
          endDate: b.endDate.slice(0, 10),
          purpose: b.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load booking')
      }
    }
    load()
  }, [id])

  // TODO 1: update form when an input changes
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // TODO 2 + 3: POST a new booking, or PATCH when editing
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const body = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }
    try {
      if (id) {
        await api.patch(`/bookings/${id}`, body)
      } else {
        await api.post('/bookings', body)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save booking')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="roomNumber"
          placeholder="Room number (e.g. B2-104)"
          value={form.roomNumber}
          onChange={onChange}
        />
        <div>
          <label className="block text-sm mb-1">Start date</label>
          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">End date</label>
          <input
            className="input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
          />
        </div>
        <textarea
          className="input"
          name="purpose"
          placeholder="Purpose (optional)"
          value={form.purpose}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}


