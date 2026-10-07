import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
const emptyForm = { roomNumber: "", startDate: "", endDate: "", purpose: "" };

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // TODO 3: when there is an id, load that booking into the form
  useEffect(() => {
    setError("");

    if (!id) {
      setForm(emptyForm);
      return;
    }

    api
      .get(`/bookings/${id}`)
      .then((res) => {
          const booking = res.data.booking;
        setForm({
          roomNumber: booking.roomNumber,
          startDate: booking.startDate.slice(0, 10),
          endDate: booking.endDate.slice(0, 10),
          purpose: booking.purpose || "",
        });
      })
      .catch((err) => {        setError(err.response?.data?.message || "Could not load this booking.");
      });
  }, [id]);

  // TODO 1: update form when the user types
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // TODO 2 + 3: POST for a new booking, PATCH when editing
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form);
      } else {
        await api.post("/bookings", form);
      }
      navigate("/bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        {id ? "Edit booking" : "Book a room"}
      </h1>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomNumber" className="mb-1 block text-sm font-medium">
            Room number
          </label>
          <input
            id="roomNumber"
            name="roomNumber"
            type="text"
            value={form.roomNumber}
            onChange={onChange}
            placeholder="B2-104"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
              Start date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={onChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
              End date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={onChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="purpose" className="mb-1 block text-sm font-medium">
            Purpose (optional)
          </label>
          <textarea
            id="purpose"
            name="purpose"
            rows={3}
            value={form.purpose}
            onChange={onChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {id ? "Save changes" : "Book room"}
          </button>
          <Link to="/bookings" className="rounded border px-4 py-2">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}