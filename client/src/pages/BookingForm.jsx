import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// The api instance is imported to perform authenticated requests; it handles the base URL and attaches the JWT token automatically.
import { api } from '../api';

const BookingForm = () => {
  // useParams is used to extract the 'id' from the URL; without it, the component wouldn't know if it's in 'create' or 'edit' mode.
  const { id } = useParams();
  // useNavigate is a hook that allows programmatic navigation; without it, we cannot redirect the user after a successful booking.
  const navigate = useNavigate();

  // useState is used here to track the error message; without it, the UI cannot reactively show or clear validation errors.
  const [error, setError] = useState(null);

  // FIX: Added isLoading state. Without this, the component might try to render fields or perform logic on data that hasn't arrived yet,
  // and provides a way to prevent the "blank page" feel by showing a loading indicator.
  const [isLoading, setIsLoading] = useState(false);

  // useState manages the form data as a single object to avoid creating four separate state variables, ensuring synchronized updates.
  // FIX: Verified initial state contains empty strings to prevent "uncontrolled to controlled" warnings which can sometimes disrupt rendering.
  const [formData, setFormData] = useState({
    roomNumber: '',
    startDate: '',
    endDate: '',
    purpose: '',
  });

  // useEffect is necessary to fetch existing data once the component mounts; deleting this would leave the form empty when editing an existing booking.
  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;

      // FIX: Set loading to true immediately to signal that we are in a transition state.
      setIsLoading(true);
      try {
        const response = await api.get(`/bookings/${id}`);
        const booking = response.data;

        // FIX: Added a check to ensure 'booking' and the date fields exist before calling .slice().
        // Calling .slice(0, 10) on undefined/null is the most common cause of a runtime crash (TypeError),
        // which results in a completely blank page because the entire component tree unmounts.
        if (booking && booking.startDate && booking.endDate) {
          setFormData({
            roomNumber: booking.roomNumber || '',
            startDate: booking.startDate.slice(0, 10),
            endDate: booking.endDate.slice(0, 10),
            purpose: booking.purpose || '',
          });
        }
      } catch (err) {
        const serverMessage = err.response?.data?.message || 'Failed to load booking details.';
        setError(serverMessage);
      } finally {
        // FIX: Ensure loading is set to false regardless of success or failure to allow the UI to render.
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id]); // The dependency array [id] ensures this effect re-runs if the ID in the URL changes.

  // This handler dynamically updates the form state based on the input's 'name' attribute; deleting this would require individual handlers for every field.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // This function handles the form submission logic; removing it would prevent the form from actually sending data to a backend.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation check; without this, the application might crash or save empty data to the database.
    if (!formData.roomNumber || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (id) {
        // If an ID exists, we use PATCH to update the specific resource; using POST here would create a duplicate booking instead of editing.
        await api.patch(`/bookings/${id}`, {
          roomNumber: formData.roomNumber,
          startDate: formData.startDate,
          endDate: formData.endDate,
          purpose: formData.purpose,
        });
      } else {
        // If no ID exists, we use POST to create a new resource.
        await api.post('/bookings', {
          roomNumber: formData.roomNumber,
          startDate: formData.startDate,
          endDate: formData.endDate,
          purpose: formData.purpose,
        });
      }

      // If the request succeeds, we navigate to the bookings list; failing to do this would leave the user on the form without confirmation.
      navigate('/bookings');
    } catch (err) {
      // The catch block handles server errors (e.g., 400 for dates, 403 for unauthorized edits, or 409 for conflicts).
      const serverMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(serverMessage);
    }
  };

  // FIX: Guard clause for loading state. This prevents the component from attempting to render the form
  // with potentially inconsistent state during the initial fetch, ensuring a smooth transition.
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 text-center text-gray-600">
        Loading booking details...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {id ? 'Edit Booking' : 'Book a Room'}
      </h2>

      {/* Conditional rendering: the error box only appears if 'error' is truthy; without this check, an empty red box would always show. */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Room Number *</label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. 101"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Purpose (Optional)</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Reason for booking..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-semibold"
        >
          {id ? 'Update Booking' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
