import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Load existing booking if in edit mode
  useEffect(() => {
    if (!id) return
    
    api.get(`/bookings/${id}`)
      .then(res => {
        const b = res.data.booking
        // Format ISO date strings (2026-10-10T00:00:00.000Z) to YYYY-MM-DD for the HTML date inputs
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: b.startDate ? b.startDate.substring(0, 10) : '',
          endDate: b.endDate ? b.endDate.substring(0, 10) : '',
          purpose: b.purpose || ''
        })
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to load booking')
      })
  }, [id])

  // Update form state dynamically based on the input's name attribute
  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Submit the form
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    
    try {
      if (id) {
        // Edit mode: PATCH request to update
        await api.patch(`/bookings/${id}`, form)
      } else {
        // Create mode: POST request to create
        await api.post('/bookings', form)
      }
      // Navigate back to the bookings list on success
      nav('/bookings')
    } catch (err) {
      // Catch HTTP 400, 403, 409, etc. and display the server's error message
      setError(err?.response?.data?.message || 'Failed to save booking')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium mb-1">Room Number</label>
          <input 
            name="roomNumber"
            className="input" 
            placeholder="e.g. B2-104"
            value={form.roomNumber} 
            onChange={onChange} 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input 
              type="date"
              name="startDate"
              className="input" 
              value={form.startDate} 
              onChange={onChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input 
              type="date"
              name="endDate"
              className="input" 
              value={form.endDate} 
              onChange={onChange} 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Purpose (Optional)</label>
          <textarea 
            name="purpose"
            className="input" 
            placeholder="Reason for booking..."
            value={form.purpose} 
            onChange={onChange} 
            rows="3"
          />
        </div>

        {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        
        <div className="pt-2 flex gap-2">
          <button className="btn bg-blue-600 text-white border-blue-600 hover:bg-blue-700" type="submit">
            Save Booking
          </button>
          <button 
            type="button" 
            className="btn" 
            onClick={() => nav('/bookings')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}