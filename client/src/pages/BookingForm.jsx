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
  const [submitting, setSubmitting] = useState(false)

  // TODO (edit mode): when there is an `id`, load the booking and fill the form.
  useEffect(() => {
    if (!id) return
    setError('')
    api.get(`/bookings/${id}`)
      .then(res => {
        const b = res.data.booking
        function toInputDate(iso) {
          if (!iso) return ''
          const d = new Date(iso)
          const yyyy = d.getUTCFullYear()
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
          const dd = String(d.getUTCDate()).padStart(2, '0')
          return `${yyyy}-${mm}-${dd}`
        }
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: toInputDate(b.startDate),
          endDate: toInputDate(b.endDate),
          purpose: b.purpose || ''
        })
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load booking'))
  }, [id])

  // TODO: update `form` when an input changes.
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // TODO: POST a new booking, or PATCH the existing one when editing,
  // then go back to /bookings. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      setSubmitting(true)
      const payload = {
        roomNumber: form.roomNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        purpose: form.purpose
      }
      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Room number</label>
          <input name="roomNumber" value={form.roomNumber} onChange={onChange} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start date</label>
            <input name="startDate" type="date" value={form.startDate} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End date</label>
            <input name="endDate" type="date" value={form.endDate} onChange={onChange} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Purpose (optional)</label>
          <textarea name="purpose" value={form.purpose} onChange={onChange} className="input h-24" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  )
}
