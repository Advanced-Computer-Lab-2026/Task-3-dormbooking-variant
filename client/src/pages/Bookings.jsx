import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

function formatDate(d) {
  return new Date(d).toLocaleDateString()
}

export default function Bookings() {
  const { user } = useAuth()
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookingToCancel, setBookingToCancel] = useState(null)

  async function load() {
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.bookings)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function confirmCancel() {
    const id = bookingToCancel
    setBookingToCancel(null)
    if (!id) return
    setError('')
    try {
      await api.delete('/bookings/' + id)
      setBookings(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      setError(err?.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <div className="space-y-4">
      {location.state?.message && (
        <div className="text-green-700 text-sm" role="status">{location.state.message}</div>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="card w-full max-w-sm space-y-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
          >
            <h2 id="cancel-booking-title" className="text-lg font-semibold">
              Cancel this booking?
            </h2>
            <p className="text-sm text-zinc-600">Are you sure you want to cancel this booking?</p>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setBookingToCancel(null)}>
                No, don’t cancel
              </button>
              <button className="btn" onClick={confirmCancel}>
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map(b => {
          const isMine = user && b.bookedBy?._id === user.id
          return (
            <div key={b._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Room {b.roomNumber}</div>
                  <div className="text-sm text-zinc-600">
                    {formatDate(b.startDate)} – {formatDate(b.endDate)} • by {b.bookedBy?.name || 'unknown'}
                  </div>
                </div>
                {isMine && (
                  <div className="flex gap-2">
                    <Link to={`/bookings/${b._id}`} className="btn text-sm">Edit</Link>
                    <button onClick={() => setBookingToCancel(b._id)} className="btn text-sm">Cancel</button>
                  </div>
                )}
              </div>
              {b.purpose && <p className="mt-2 text-sm">{b.purpose}</p>}
            </div>
          )
        })}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-sm text-zinc-600">No bookings yet.</div>
        )}
      </div>
    </div>
  )
}
