import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  DollarSign,
  Home,
  FileText,
  Loader2
} from 'lucide-react';
import bookingService from '../services/bookingService';

const BookingConfirmation = () => {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [reference]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingByReference(reference);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-400 mb-4">Booking not found</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-50 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-teal-600" />
          </div>
          <h1 className="text-4xl font-heading font-semibold text-primary mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-primary-600">
            Your reservation has been successfully created
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-background-paper rounded-2xl shadow-elegant border border-secondary-200 overflow-hidden mb-6">
          {/* Reference Number */}
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 px-8 py-6 border-b border-secondary-200">
            <p className="text-sm text-primary-400 mb-1">Booking Reference</p>
            <p className="text-3xl font-heading font-semibold text-primary tracking-wider">
              {booking.booking_reference}
            </p>
            <p className="text-sm text-primary-400 mt-2">
              Please save this reference number for your records
            </p>
          </div>

          {/* Booking Info */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Room Details */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                  Room Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-primary-400">Room</p>
                      <p className="font-medium text-primary">{booking.room_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-primary-400">Location</p>
                      <p className="font-medium text-primary">{booking.location_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                  Guest Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-primary-400">Name</p>
                      <p className="font-medium text-primary">{booking.guest_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-primary-400">Email</p>
                      <p className="font-medium text-primary">{booking.guest_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-primary-400">Phone</p>
                      <p className="font-medium text-primary">{booking.guest_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="mb-8 p-6 bg-background rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-primary-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Check-in
                  </p>
                  <p className="font-medium text-primary">{formatDate(booking.check_in_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Check-out
                  </p>
                  <p className="font-medium text-primary">{formatDate(booking.check_out_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-400 mb-2">Duration</p>
                  <p className="font-medium text-primary">{nights} night{nights > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-secondary-200 pt-8">
              <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                Payment Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-primary-600">Total Amount</span>
                  <span className="font-medium text-primary">${booking.total_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Downpayment Paid</span>
                  <span className="font-medium text-teal-600">${booking.downpayment_amount}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-secondary-200">
                  <span className="font-semibold text-primary">Remaining Balance</span>
                  <span className="text-xl font-heading font-semibold text-primary">
                    ${(parseFloat(booking.total_price) - parseFloat(booking.downpayment_amount)).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-primary-400 mt-4">
                Remaining balance due at check-in
              </p>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-700 mb-2">Special Requests</p>
                <p className="text-blue-600">{booking.special_requests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-background-paper rounded-2xl shadow-elegant border border-secondary-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Confirmation Email Sent</h3>
              <p className="text-sm text-primary-600">
                A confirmation email has been sent to <strong>{booking.guest_email}</strong> with all booking details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Print Confirmation
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
