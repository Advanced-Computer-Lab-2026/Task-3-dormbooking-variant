import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return

    let cancelled = false
    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        if (!cancelled) {
          const booking = data.booking
          setForm({
            roomNumber: booking.roomNumber || '',
            startDate: booking.startDate?.slice(0, 10) || '',
            endDate: booking.endDate?.slice(0, 10) || '',
            purpose: booking.purpose || ''
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Could not load booking')
        }
      }
    }

    loadBooking()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const { roomNumber, startDate, endDate, purpose } = form
    const payload = { roomNumber, startDate, endDate, purpose }
    try {
      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings', {
        state: { message: id ? 'Booking updated successfully.' : 'Booking created successfully.' }
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save booking')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          type="text"
          name="roomNumber"
          value={form.roomNumber}
          onChange={onChange}
          placeholder="Room number (e.g. B2-104)"
        />
        <label className="block space-y-1">
          <span className="text-sm">Start date</span>
          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm">End date</span>
          <input
            className="input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
          />
        </label>
        <textarea
          className="input"
          name="purpose"
          value={form.purpose}
          onChange={onChange}
          placeholder="Purpose (optional)"
          rows="3"
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
