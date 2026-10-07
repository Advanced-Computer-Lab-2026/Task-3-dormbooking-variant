import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  roomNumber: '',
  startDate: '',
  endDate: '',
  purpose: '',
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
console.log(res.data)

const b = res.data.booking ?? res.data

setForm({
  roomNumber: b.roomNumber ?? '',
  startDate: b.startDate ? b.startDate.slice(0, 10) : '',
  endDate: b.endDate ? b.endDate.slice(0, 10) : '',
  purpose: b.purpose ?? '',
})
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking')
      }
    }

    loadBooking()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
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
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Booking
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          name="roomNumber"
          placeholder="B2-104"
          value={form.roomNumber}
          onChange={onChange}
          className="w-full border rounded px-3 py-2"
        />

        <div>
          <label className="block text-sm mb-1">
            Start date
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            End date
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <textarea
          name="purpose"
          placeholder="Purpose (optional)"
          value={form.purpose}
          onChange={onChange}
          rows={3}
          className="w-full border rounded px-3 py-2"
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