import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

function formatDate(d) {
  return new Date(d).toLocaleDateString()
}

export default function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.bookings || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function isMine(booking) {
    const ownerId = booking.bookedBy?._id || booking.bookedBy?.id
    return Boolean(user?.id && ownerId && String(ownerId) === String(user.id))
  }

  const visibleBookings = bookings.filter(booking => view === 'all' || isMine(booking))

  async function onCancel(id) {
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bookings</h1>
          <p className="mt-1 text-sm text-slate-600">
            {view === 'mine' ? 'Your reservations' : 'Browse room reservations'}
          </p>
        </div>
        <div className="flex gap-2" aria-label="Filter bookings">
          <button type="button" onClick={() => setView('all')} className={`btn text-sm ${view === 'all' ? '' : 'booking-filter'}`}>
            All bookings ({bookings.length})
          </button>
          <button type="button" onClick={() => setView('mine')} className={`btn text-sm ${view === 'mine' ? '' : 'booking-filter'}`}>
            Mine ({bookings.filter(isMine).length})
          </button>
        </div>
      </div>
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button type="button" onClick={load} className="font-semibold underline">Retry</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card text-sm text-slate-600" role="status">Loading bookings…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleBookings.map(b => {
          const mine = isMine(b)
          return (
            <div key={b._id} className={`card ${mine ? 'booking-card--mine' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Room {b.roomNumber}</div>
                  {mine && <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Your booking</div>}
                  <div className="text-sm text-zinc-600">
                    {formatDate(b.startDate)} – {formatDate(b.endDate)} • by {b.bookedBy?.name || 'unknown'}
                  </div>
                </div>
                {mine && (
                  <div className="flex gap-2">
                    <Link to={`/bookings/${b._id}`} className="btn text-sm">Edit</Link>
                    <button onClick={() => onCancel(b._id)} className="btn text-sm">Cancel</button>
                  </div>
                )}
              </div>
              {b.purpose && <p className="mt-2 text-sm">{b.purpose}</p>}
            </div>
          )
        })}
        {!error && visibleBookings.length === 0 && (
          <div className="card text-sm text-slate-600 md:col-span-2">
            {view === 'mine' ? 'You have no bookings yet.' : 'No bookings yet.'}
          </div>
        )}
        </div>
      )}
    </div>
  )
}
