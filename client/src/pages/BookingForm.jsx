import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// "2026-10-10T00:00:00.000Z" -> "2026-10-10"
const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : '')

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        if (cancelled) return
        const b = data.booking ?? data // handles { booking } or a bare object
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || '',
        })
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load booking')
      }
    }
    loadBooking()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { roomNumber, startDate, endDate, purpose } = form
    const payload = { roomNumber, startDate, endDate, purpose } // never bookedBy
    try {
      if (id) await api.patch(`/bookings/${id}`, payload)
      else await api.post('/bookings', payload)
      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Room Number</label>
          <input name="roomNumber" value={form.roomNumber} onChange={onChange}
            placeholder="e.g. B2-104" className="input" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Start Date</label>
          <input name="startDate" type="date" value={form.startDate}
            onChange={onChange} className="input" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">End Date</label>
          <input name="endDate" type="date" value={form.endDate}
            onChange={onChange} className="input" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Purpose (optional)</label>
          <textarea name="purpose" value={form.purpose} onChange={onChange}
            className="input" rows="3" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}