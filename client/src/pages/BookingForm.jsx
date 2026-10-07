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
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let active = true
    setForm(defaults)
    setError('')
    setLoadFailed(false)
    setLoading(Boolean(id))
    if (!id) return

    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        if (!active) return
        const { booking } = data
        setForm({
          roomNumber: booking.roomNumber,
          // Date inputs accept YYYY-MM-DD, not a full ISO timestamp.
          startDate: booking.startDate.slice(0, 10),
          endDate: booking.endDate.slice(0, 10),
          purpose: booking.purpose || ''
        })
      } catch (err) {
        if (!active) return
        setError(err?.response?.data?.message || 'Could not load booking')
        setLoadFailed(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBooking()
    // Ignore an old request if the route changes or the page unmounts.
    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (loading || saving || loadFailed) return
    setError('')
    setSaving(true)
    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form)
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
        <fieldset disabled={loading || saving || loadFailed} className="space-y-3">
          <div>
            <label htmlFor="roomNumber" className="block text-sm mb-1">Room number</label>
            <input id="roomNumber" name="roomNumber" type="text" className="input" placeholder="B2-104" value={form.roomNumber} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm mb-1">Start date</label>
            <input id="startDate" name="startDate" type="date" className="input" value={form.startDate} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm mb-1">End date</label>
            <input id="endDate" name="endDate" type="date" className="input" value={form.endDate} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="purpose" className="block text-sm mb-1">Purpose (optional)</label>
            <textarea id="purpose" name="purpose" className="input" rows={3} value={form.purpose} onChange={onChange} />
          </div>
          <button className="btn disabled:opacity-50" type="submit">{saving ? 'Saving…' : 'Save'}</button>
        </fieldset>
        {error && <div role="alert" className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  )
}
