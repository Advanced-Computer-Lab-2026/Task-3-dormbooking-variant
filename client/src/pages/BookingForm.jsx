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
    async function load() {
      try {
        const res = await api.get('/bookings/' + id)
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: b.startDate?.split('T')[0] || '',
          endDate: b.endDate?.split('T')[0] || '',
          purpose: b.purpose || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load booking')
      }
    }
    load()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch('/bookings/' + id, form)
      } else {
        await api.post('/bookings', form)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred while saving')
    }
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
            placeholder="e.g. B2-104"
            value={form.roomNumber}
            onChange={onChange}
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
          <label className="block text-sm font-medium mb-1">Purpose (optional)</label>
          <textarea
            className="input w-full"
            name="purpose"
            rows="3"
            value={form.purpose}
            onChange={onChange}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" type="submit">Save</button>
      </form>
    </div>
  )
}
