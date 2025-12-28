import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Users, CreditCard, AlertCircle, CheckCircle, ArrowLeft, Hotel } from 'lucide-react';
import { toast } from 'react-toastify';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';

const BookingCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState(null);

  const [formData, setFormData] = useState({
    checkInDate: searchParams.get('checkIn') || '',
    checkOutDate: searchParams.get('checkOut') || '',
    numGuests: 1,
    guestName: user ? `${user.first_name} ${user.last_name}` : '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
    specialRequests: ''
  });

  const roomId = searchParams.get('roomId');

  useEffect(() => {
    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      calculatePricing();
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRoomById(roomId);
      setRoom(response.data.room);
    } catch (error) {
      toast.error('Failed to load room details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!room) return;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      setPricing(null);
      return;
    }

    const basePrice = parseFloat(room.base_price || 0);
    const totalAmount = basePrice * nights;
    const downpaymentPercentage = user ? 20 : 50;
    const downpaymentAmount = (totalAmount * downpaymentPercentage) / 100;
    const balanceAmount = totalAmount - downpaymentAmount;

    setPricing({
      nights,
      basePrice,
      totalAmount,
      downpaymentPercentage,
      downpaymentAmount,
      balanceAmount
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.checkInDate || !formData.checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      setSubmitting(true);

      let response;
      if (user) {
        // Registered user booking
        response = await bookingService.createUserBooking({
          roomId: parseInt(roomId),
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numGuests: parseInt(formData.numGuests),
          specialRequests: formData.specialRequests
        });
      } else {
        // Guest booking
        response = await bookingService.createGuestBooking({
          roomId: parseInt(roomId),
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numGuests: parseInt(formData.numGuests),
          specialRequests: formData.specialRequests
        });
      }

      toast.success('Booking created successfully!');
      navigate(`/booking-confirmation?reference=${response.data.bookingReference}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/rooms')} className="btn-primary">
            Browse Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-background-paper border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Hotel className="w-8 h-8 text-accent" />
              <span className="text-xl font-heading font-semibold text-primary">Grand Hotel</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/rooms')}
                className="flex items-center gap-2 text-primary-500 hover:text-accent font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Rooms
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-primary">Complete Your Booking</h1>
          <p className="text-primary-400 mt-1">Just a few more details and you're all set</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dates */}
              <div className="card p-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Stay Dates
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="checkInDate"
                      className="input-field"
                      value={formData.checkInDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="checkOutDate"
                      className="input-field"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              {!user && (
                <div className="card p-6">
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Guest Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="guestName"
                        className="input-field"
                        value={formData.guestName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="guestEmail"
                        className="input-field"
                        value={formData.guestEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="guestPhone"
                        className="input-field"
                        value={formData.guestPhone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="card p-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                  Additional Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests *
                    </label>
                    <select
                      name="numGuests"
                      className="input-field"
                      value={formData.numGuests}
                      onChange={handleChange}
                      required
                    >
                      {[...Array(room.max_occupancy)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      className="input-field"
                      rows="3"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="Any special requirements or preferences..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !pricing}
                className="btn-primary w-full py-3 text-lg"
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Booking Summary
              </h2>

              {/* Room Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900">{room.room_type.toUpperCase()} - Room {room.room_number}</h3>
                <p className="text-sm text-gray-600">{room.location_name}</p>
              </div>

              {/* Pricing Breakdown */}
              {pricing && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ${pricing.basePrice.toFixed(2)} × {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="font-medium">${pricing.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>${pricing.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start">
                      <CreditCard className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          Pay {pricing.downpaymentPercentage}% Now
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          ${pricing.downpaymentAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Remaining balance: ${pricing.balanceAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Free cancellation</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Cancel up to 24 hours before check-in
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;
