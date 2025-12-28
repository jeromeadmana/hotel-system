import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Users, MapPin, Mail, Phone, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import { bookingService } from '../../services/bookingService';

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      loadBooking();
    }
  }, [reference]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingByReference(reference);
      setBooking(response.data.booking);
    } catch (error) {
      toast.error('Failed to load booking details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find a booking with that reference.</p>
          <button onClick={() => navigate('/rooms')} className="btn-primary">
            Browse Rooms
          </button>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your reservation has been successfully created
          </p>
        </div>

        {/* Booking Reference */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-primary to-primary-dark text-white text-center">
          <p className="text-sm opacity-90 mb-1">Booking Reference</p>
          <p className="text-3xl font-heading font-bold tracking-wider">
            {booking.booking_reference}
          </p>
          <p className="text-sm opacity-90 mt-2">
            Please save this reference number for future use
          </p>
        </div>

        {/* Booking Details */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
            Booking Details
          </h2>

          <div className="space-y-4">
            {/* Room Info */}
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {booking.room_type?.toUpperCase()} - Room {booking.room_number}
                </p>
                <p className="text-sm text-gray-600">{booking.location_name}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {checkInDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {' → '}
                  {checkOutDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">{nights} {nights === 1 ? 'night' : 'nights'}</p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {booking.num_guests} {booking.num_guests === 1 ? 'Guest' : 'Guests'}
                </p>
              </div>
            </div>

            {/* Guest Contact (if guest booking) */}
            {booking.guest_email && (
              <>
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{booking.guest_name}</p>
                    <p className="text-sm text-gray-600">{booking.guest_email}</p>
                  </div>
                </div>
                {booking.guest_phone && (
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">{booking.guest_phone}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Payment Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-medium">${parseFloat(booking.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Downpayment ({booking.downpayment_percentage}%)</span>
              <span className="font-medium">${parseFloat(booking.downpayment_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Balance Due</span>
              <span className="font-medium">${parseFloat(booking.balance_amount).toFixed(2)}</span>
            </div>
            {booking.cross_location_fee > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cross-location Fee</span>
                <span>${parseFloat(booking.cross_location_fee).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Payment Status:</strong> {booking.payment_status.toUpperCase()}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              The remaining balance is due at check-in
            </p>
          </div>
        </div>

        {/* Special Requests */}
        {booking.special_requests && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">
              Special Requests
            </h2>
            <p className="text-gray-600">{booking.special_requests}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="card p-6 mb-6 bg-gray-50">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">
            What's Next?
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
              <span>A confirmation email has been sent to your email address</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
              <span>You'll receive a reminder 24 hours before check-in</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
              <span>Please bring your booking reference and ID to check-in</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/rooms')}
            className="btn-secondary flex-1"
          >
            Browse More Rooms
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary flex-1"
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
