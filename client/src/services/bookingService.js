import api from '../config/api';

export const bookingService = {
  // Create guest booking (no auth)
  createGuestBooking: async (bookingData) => {
    const response = await api.post('/bookings/guest', bookingData);
    return response.data;
  },

  // Create user booking (authenticated)
  createUserBooking: async (bookingData) => {
    const response = await api.post('/bookings/user', bookingData);
    return response.data;
  },

  // Create staff-assisted booking
  createStaffAssistedBooking: async (bookingData) => {
    const response = await api.post('/bookings/staff-assisted', bookingData);
    return response.data;
  },

  // Create reservation (super admin only)
  createReservation: async (bookingData) => {
    const response = await api.post('/bookings/reserve', bookingData);
    return response.data;
  },

  // Get all bookings (with filters)
  getBookings: async (filters = {}) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },

  // Get my bookings (authenticated user)
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Get booking by reference (for guests)
  getBookingByReference: async (reference) => {
    const response = await api.get(`/bookings/reference/${reference}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id, status, cancellationReason = null) => {
    const response = await api.patch(`/bookings/${id}/status`, {
      status,
      cancellation_reason: cancellationReason
    });
    return response.data;
  },

  // Check room availability
  checkAvailability: async (roomId, checkInDate, checkOutDate) => {
    const response = await api.get('/bookings/check-availability', {
      params: { roomId, checkInDate, checkOutDate }
    });
    return response.data;
  }
};
