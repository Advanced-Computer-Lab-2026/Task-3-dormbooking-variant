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
    api.get(`/bookings/${id}`)
      .then(({ data }) => {
        const b = data.booking
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: b.startDate ? b.startDate.slice(0, 10) : '',
          endDate: b.endDate ? b.endDate.slice(0, 10) : '',
          purpose: b.purpose || ''
        })
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load booking'))
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const { roomNumber, startDate, endDate, purpose } = form
    const payload = { roomNumber, startDate, endDate, purpose }
    try {
      if (id) await api.patch(`/bookings/${id}`, payload)
      else await api.post('/bookings', payload)
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
        <input
          className="input"
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={onChange}
        />
        <input
          className="input"
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={onChange}
        />
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
//adham