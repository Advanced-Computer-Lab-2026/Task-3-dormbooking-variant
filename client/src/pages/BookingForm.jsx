import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadBooking() {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/bookings/${id}`)
        const b = res.data
        setForm({
          roomNumber: b.roomNumber,
          startDate: b.startDate.split('T')[0],
          endDate: b.endDate.split('T')[0],
          purpose: b.purpose || '',
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load booking')
      } finally {
        setLoading(false)
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
    setLoading(true)
    try {
      const body = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose,
      }
      if (id) {
        await api.patch(`/bookings/${id}`, body)
      } else {
        await api.post('/bookings', body)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading && id) {
    return <div className="max-w-lg mx-auto text-center py-10">Loading booking...</div>
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Room Number</label>
          <input
            className="input w-full"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="e.g. 101"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              className="input w-full"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              className="input w-full"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Purpose (Optional)</label>
          <textarea
            className="input w-full"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            rows="3"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Booking'}
        </button>
      </form>
    </div>
  )
}
