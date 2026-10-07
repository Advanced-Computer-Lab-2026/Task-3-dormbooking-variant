import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const emptyForm = {
  roomNumber: '',
  startDate: '',
  endDate: '',
  purpose: '',
}

export default function BookingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) {
      setForm(emptyForm)
      setError('')
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadBooking() {
      setIsLoading(true)
      setError('')
      try {
        const response = await api.get(`/bookings/${id}`)
        // The API wraps the record in { booking }; ISO dates need YYYY-MM-DD for date inputs.
        const booking = response.data.booking
        if (!booking) throw new Error('Booking details were not returned by the server.')
        if (!cancelled) {
          setForm({
            roomNumber: booking.roomNumber || '',
            startDate: booking.startDate ? booking.startDate.slice(0, 10) : '',
            endDate: booking.endDate ? booking.endDate.slice(0, 10) : '',
            purpose: booking.purpose || '',
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err.message || 'Failed to load booking details.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadBooking()
    return () => { cancelled = true }
  }, [id])

  function onChange(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // The server derives bookedBy from the authenticated request, so send only form fields.
      if (id) {
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
      }
      navigate('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="max-w-xl mx-auto card text-sm text-zinc-600">Loading booking details…</div>
  }

  return (
    <div className="max-w-xl mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit Booking' : 'Book a Room'}</h1>
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1 text-sm font-medium">
          <span>Room number</span>
          <input className="input" type="text" name="roomNumber" value={form.roomNumber} onChange={onChange} placeholder="e.g. B2-104" required />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-sm font-medium">
            <span>Start date</span>
            <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} required />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            <span>End date</span>
            <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
          </label>
        </div>

        <label className="block space-y-1 text-sm font-medium">
          <span>Purpose <span className="font-normal text-zinc-500">(optional)</span></span>
          <textarea className="input" name="purpose" value={form.purpose} onChange={onChange} rows={3} placeholder="Reason for booking…" />
        </label>

        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : id ? 'Save changes' : 'Book room'}
        </button>
      </form>
    </div>
  )
}
