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
    let active = true
    setForm(defaults)
    setError('')
    setLoading(Boolean(id))
    if (!id) return

    async function load() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        if (!active) return
        const booking = data.booking
        setForm({
          roomNumber: booking.roomNumber,
          // Date inputs accept YYYY-MM-DD, without the ISO time suffix.
          startDate: booking.startDate.slice(0, 10),
          endDate: booking.endDate.slice(0, 10),
          purpose: booking.purpose || ''
        })
      } catch (err) {
        if (active) setError(err?.response?.data?.message || 'Could not load booking')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    // Ignore responses for a booking after leaving its page.
    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (loading || saving) return
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
        {loading && <p role="status" className="text-sm text-zinc-600">Loading booking...</p>}
        <fieldset disabled={loading || saving} className="space-y-3">
          <label className="block">
            <span className="sr-only">Room number</span>
            <input className="input" name="roomNumber" type="text" placeholder="Room number (e.g. B2-104)" value={form.roomNumber} onChange={onChange} required />
          </label>
          <label className="block">
            <span className="text-sm">Start date</span>
            <input className="input" name="startDate" type="date" value={form.startDate} onChange={onChange} required />
          </label>
          <label className="block">
            <span className="text-sm">End date</span>
            <input className="input" name="endDate" type="date" value={form.endDate} onChange={onChange} required />
          </label>
          <label className="block">
            <span className="sr-only">Purpose (optional)</span>
            <textarea className="input" name="purpose" placeholder="Purpose (optional)" rows={3} value={form.purpose} onChange={onChange} />
          </label>
          <button className="btn" type="submit">{saving ? 'Saving...' : 'Save'}</button>
        </fieldset>
        {error && <div role="alert" className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  )
}
