import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  CreditCard,
  User,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import roomService from '../services/roomService';
import bookingService from '../services/bookingService';

const BookingCheckout = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    check_in_date: '',
    check_out_date: '',
    num_guests: 1,
    guest_name: user ? `${user.firstName} ${user.lastName}` : '',
    guest_email: user?.email || '',
    guest_phone: '',
    special_requests: ''
  });

  const [priceBreakdown, setPriceBreakdown] = useState({
    nights: 0,
    basePrice: 0,
    totalPrice: 0,
    downpayment: 0
  });

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  useEffect(() => {
    calculatePrice();
  }, [formData.check_in_date, formData.check_out_date, room]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRoomById(roomId);
      setRoom(response.data.room);
    } catch (error) {
      console.error('Error fetching room:', error);
      toast.error('Failed to load room details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!formData.check_in_date || !formData.check_out_date || !room) return;

    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      setPriceBreakdown({ nights: 0, basePrice: 0, totalPrice: 0, downpayment: 0 });
      return;
    }

    const basePrice = parseFloat(room.base_price);
    const totalPrice = basePrice * nights;
    const downpaymentRate = user ? 0.2 : 0.5; // 20% for registered, 50% for guests
    const downpayment = totalPrice * downpaymentRate;

    setPriceBreakdown({
      nights,
      basePrice,
      totalPrice,
      downpayment
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.check_in_date || !formData.check_out_date) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (priceBreakdown.nights <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!formData.guest_name || !formData.guest_email || !formData.guest_phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        room_id: roomId,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        num_guests: parseInt(formData.num_guests),
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        special_requests: formData.special_requests
      };

      let response;
      if (user) {
        // Registered user booking
        response = await bookingService.createUserBooking(bookingData);
      } else {
        // Guest booking
        response = await bookingService.createGuestBooking(bookingData);
      }

      toast.success('Booking created successfully!');
      navigate(`/booking/confirmation/${response.data.booking.booking_reference}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-paper border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Room</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-heading font-semibold text-primary mb-8">
          Complete Your Booking
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dates & Guests */}
              <div className="bg-background-paper rounded-2xl shadow-elegant border border-secondary-200 p-6">
                <h2 className="text-xl font-heading font-semibold text-primary mb-6">
                  Reservation Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      name="check_in_date"
                      value={formData.check_in_date}
                      onChange={handleChange}
                      min={getTodayDate()}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      name="check_out_date"
                      value={formData.check_out_date}
                      onChange={handleChange}
                      min={formData.check_in_date || getTodayDate()}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    name="num_guests"
                    value={formData.num_guests}
                    onChange={handleChange}
                    min="1"
                    max={room.max_occupancy}
                    required
                    className="input-field"
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    Maximum {room.max_occupancy} guests
                  </p>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-background-paper rounded-2xl shadow-elegant border border-secondary-200 p-6">
                <h2 className="text-xl font-heading font-semibold text-primary mb-6">
                  Guest Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={formData.guest_phone}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleChange}
                      rows="3"
                      className="input-field resize-none"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || priceBreakdown.nights <= 0}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Confirm Booking
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background-paper rounded-2xl shadow-elegant border border-secondary-200 p-6 sticky top-24">
              <h2 className="text-xl font-heading font-semibold text-primary mb-6">
                Booking Summary
              </h2>

              {/* Room Info */}
              <div className="mb-6 pb-6 border-b border-secondary-200">
                <h3 className="font-medium text-primary mb-2">{room.public_name}</h3>
                <p className="text-sm text-primary-400">{room.location_name}</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                {priceBreakdown.nights > 0 && (
                  <>
                    <div className="flex justify-between text-primary-600">
                      <span>${priceBreakdown.basePrice.toFixed(2)} × {priceBreakdown.nights} night{priceBreakdown.nights > 1 ? 's' : ''}</span>
                      <span>${priceBreakdown.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-primary-400">
                      <span>Downpayment ({user ? '20%' : '50%'})</span>
                      <span>${priceBreakdown.downpayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-primary-400">
                      <span>Remaining</span>
                      <span>${(priceBreakdown.totalPrice - priceBreakdown.downpayment).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Total */}
              <div className="pt-6 border-t border-secondary-200">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg font-semibold text-primary">Due Today</span>
                  <span className="text-3xl font-heading font-bold text-primary">
                    ${priceBreakdown.downpayment.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-primary-400">
                  Remaining ${(priceBreakdown.totalPrice - priceBreakdown.downpayment).toFixed(2)} due at check-in
                </p>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  {user ? (
                    <>
                      <strong>Registered User:</strong> Pay only 20% upfront
                    </>
                  ) : (
                    <>
                      <strong>Guest Booking:</strong> Requires 50% downpayment
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingCheckout;
