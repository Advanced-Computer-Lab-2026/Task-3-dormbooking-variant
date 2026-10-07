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
            // Date inputs need YYYY-MM-DD; the API returns full ISO strings.
            startDate: booking.startDate ? booking.startDate.slice(0, 10) : '',
            endDate: booking.endDate ? booking.endDate.slice(0, 10) : '',
            purpose: booking.purpose || ''
          })
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || 'Could not load booking')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBooking()
    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const booking = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, booking)
      } else {
        await api.post('/bookings', booking)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save booking')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      {loading ? (
        <p className="text-sm text-zinc-600">Loading booking…</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium mb-1">Room number</label>
            <input
              id="roomNumber"
              name="roomNumber"
              type="text"
              placeholder="B2-104"
              value={form.roomNumber}
              onChange={onChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={onChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">End date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={onChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium mb-1">Purpose <span className="font-normal text-zinc-500">(optional)</span></label>
            <textarea
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={onChange}
              className="input min-h-24"
              rows={3}
            />
          </div>

          {error && <div role="alert" className="text-red-600 text-sm">{error}</div>}
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}
    </div>
  )
}
