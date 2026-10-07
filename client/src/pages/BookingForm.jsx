import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Book a Room page — see README.md "Your task".
// This page is already routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let active = true
    setError('')

    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        if (!active) return
        const { booking } = data
        setForm({
          roomNumber: booking.roomNumber,
          startDate: booking.startDate.slice(0, 10),
          endDate: booking.endDate.slice(0, 10),
          purpose: booking.purpose ?? ''
        })
      } catch (err) {
        if (active) setError(err?.response?.data?.message || 'Failed to load booking')
      }
    }

    loadBooking()
    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
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
        <label className="block">
          Room number
          <input className="input" type="text" name="roomNumber" placeholder="B2-104" value={form.roomNumber} onChange={onChange} required />
        </label>
        <label className="block">
          Start date
          <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} required />
        </label>
        <label className="block">
          End date
          <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
        </label>
        <label className="block">
          Purpose (optional)
          <textarea className="input" name="purpose" rows={3} value={form.purpose} onChange={onChange} />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}