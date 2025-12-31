import api from '../config/api';

export const dashboardService = {
  /**
   * Get dashboard stats (bookings, rooms, etc.)
   */
  getStats: async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms')
      ]);

      const bookings = bookingsRes.data.data.bookings || [];
      const rooms = roomsRes.data.data.rooms || [];

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCheckIns = bookings.filter(booking => {
        const checkIn = new Date(booking.check_in_date);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn.getTime() === today.getTime() && booking.status === 'confirmed';
      }).length;

      const pendingBookings = bookings.filter(
        booking => booking.status === 'pending'
      ).length;

      const availableRooms = rooms.filter(
        room => room.status === 'available' && room.is_active
      ).length;

      return {
        totalBookings: bookings.filter(b =>
          b.status === 'confirmed' || b.status === 'checked_in'
        ).length,
        todayCheckIns,
        pendingBookings,
        availableRooms,
        totalRooms: rooms.length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async () => {
    try {
      const response = await api.get('/bookings?limit=5&sort=-created_at');
      const bookings = response.data.data.bookings || [];

      return bookings.map(booking => ({
        id: booking.id,
        action: getActivityAction(booking.status),
        detail: `${booking.room_number || 'Room'} - ${booking.guest_name}`,
        time: getRelativeTime(booking.created_at),
        type: getActivityType(booking.status),
        icon: getActivityIcon(booking.status)
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
};

// Helper functions
function getActivityAction(status) {
  const actions = {
    pending: 'New booking pending',
    confirmed: 'Booking confirmed',
    checked_in: 'Check-in completed',
    checked_out: 'Check-out completed',
    cancelled: 'Booking cancelled'
  };
  return actions[status] || 'Booking updated';
}

function getActivityType(status) {
  const types = {
    pending: 'yellow',
    confirmed: 'blue',
    checked_in: 'teal',
    checked_out: 'gray',
    cancelled: 'red'
  };
  return types[status] || 'blue';
}

function getActivityIcon(status) {
  return status;
}

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default dashboardService;
