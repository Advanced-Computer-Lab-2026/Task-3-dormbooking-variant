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
  const [loadedId, setLoadedId] = useState(null)

  useEffect(() => {
    let active = true
    setForm(defaults)
    setError('')
    setLoadedId(null)
    setLoading(Boolean(id))
    if (!id) return

    async function loadBooking() {
      try {
        const res = await api.get('/bookings/' + id)
        if (!active) return
        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber,
          // Date inputs accept YYYY-MM-DD, rather than the full ISO timestamp.
          startDate: booking.startDate.slice(0, 10),
          endDate: booking.endDate.slice(0, 10),
          purpose: booking.purpose || ''
        })
        setLoadedId(id)
      } catch (err) {
        if (active) setError(err?.response?.data?.message || 'Could not load booking')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBooking()
    // Ignore a response if the user leaves or switches to a different booking.
    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (saving || loading || (id && loadedId !== id)) return
    setError('')
    setSaving(true)
    try {
      // Only form fields are sent; the server gets bookedBy from the token.
      if (id) {
        await api.patch('/bookings/' + id, form)
      } else {
        await api.post('/bookings', form)
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
      <form onSubmit={onSubmit} className="space-y-3">
        {loading && <p role="status" className="text-sm text-zinc-600">Loading booking…</p>}
        <fieldset disabled={loading || saving || Boolean(id && loadedId !== id)} className="space-y-3 disabled:opacity-60">
          <input className="input" type="text" name="roomNumber" aria-label="Room number" placeholder="Room number (e.g. B2-104)" value={form.roomNumber} onChange={onChange} required />
          <div>
            <label htmlFor="startDate">Start date</label>
            <input className="input" id="startDate" type="date" name="startDate" value={form.startDate} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="endDate">End date</label>
            <input className="input" id="endDate" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
          </div>
          <textarea className="input" name="purpose" aria-label="Purpose (optional)" placeholder="Purpose (optional)" rows={2} value={form.purpose} onChange={onChange} />
          <button className="btn" type="submit">{saving ? 'Saving…' : 'Save'}</button>
        </fieldset>
        {error && <div role="alert" className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  )
}
