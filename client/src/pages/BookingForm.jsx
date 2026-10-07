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
        const res = await api.get(`/bookings/${id}`)
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: b.startDate.split('T')[0],
          endDate: b.endDate.split('T')[0],
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
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
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
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Room Number</label>
          <input
            type="text"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            className="input"
            placeholder="e.g. B2-104"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
              className="input"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
              className="input"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Purpose (Optional)</label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            className="input"
            rows="3"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button className="btn" type="submit">Save</button>
          <button type="button" onClick={() => nav('/bookings')} className="btn bg-zinc-200 text-zinc-800 hover:bg-zinc-300">Cancel</button>
        </div>
      </form>
    </div>
  )
}
