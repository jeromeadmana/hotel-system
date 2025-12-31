import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Home
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import bookingService from '../../services/bookingService';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle },
      checked_in: { bg: 'bg-teal-50', text: 'text-teal-700', icon: CheckCircle },
      checked_out: { bg: 'bg-gray-50', text: 'text-gray-700', icon: CheckCircle },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = (checkInDate) => {
    return new Date(checkInDate) >= new Date();
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'upcoming') return isUpcoming(booking.check_in_date);
    if (filter === 'past') return !isUpcoming(booking.check_in_date);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-paper border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-semibold text-primary">
                My Bookings
              </h1>
              <p className="text-primary-400 mt-1">
                View and manage your reservations
              </p>
            </div>
            <button
              onClick={() => navigate('/rooms')}
              className="btn-primary flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Browse Rooms
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                filter === tab.id
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-background-paper text-primary-600 hover:bg-secondary-100 border border-secondary-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map(booking => {
              const badge = getStatusBadge(booking.status);
              const StatusIcon = badge.icon;
              const checkInDate = new Date(booking.check_in_date);
              const checkOutDate = new Date(booking.check_out_date);
              const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={booking.id}
                  className="bg-background-paper rounded-2xl shadow-elegant border border-secondary-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-heading font-semibold text-primary mb-1">
                          {booking.room_number}
                        </h3>
                        <div className="flex items-center gap-2 text-primary-400">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.location_name}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${badge.bg} ${badge.text}`}>
                        <StatusIcon className="w-4 h-4" />
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-primary-400 mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Check-in
                        </p>
                        <p className="font-medium text-primary">{formatDate(booking.check_in_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-400 mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Check-out
                        </p>
                        <p className="font-medium text-primary">{formatDate(booking.check_out_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-400 mb-1 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Guests
                        </p>
                        <p className="font-medium text-primary">{booking.num_guests} {booking.num_guests === 1 ? 'guest' : 'guests'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-400 mb-1 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Total
                        </p>
                        <p className="font-medium text-primary">${booking.total_price}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-secondary-200">
                      <div>
                        <p className="text-xs text-primary-400">Booking Reference</p>
                        <p className="font-medium text-primary tracking-wider">{booking.booking_reference}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/booking/confirmation/${booking.booking_reference}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-primary rounded-xl font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-primary mb-2">
              No bookings found
            </h3>
            <p className="text-primary-400 mb-6">
              {filter === 'upcoming' ? "You don't have any upcoming reservations" :
               filter === 'past' ? "You don't have any past reservations" :
               "You haven't made any bookings yet"}
            </p>
            <button
              onClick={() => navigate('/rooms')}
              className="btn-primary"
            >
              Browse Available Rooms
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
