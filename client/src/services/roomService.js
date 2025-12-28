import api from '../config/api';

export const roomService = {
  // Get all rooms with filters
  getRooms: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/rooms?${params}`);
    return response.data;
  },

  // Get room by ID
  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Create room
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Update room
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Delete room
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  // Update room status
  updateRoomStatus: async (id, status) => {
    const response = await api.patch(`/rooms/${id}/status`, { status });
    return response.data;
  },

  // Get room rates
  getRoomRates: async (roomId) => {
    const response = await api.get(`/room-rates/room/${roomId}`);
    return response.data;
  },

  // Create room rate
  createRoomRate: async (rateData) => {
    const response = await api.post('/room-rates', rateData);
    return response.data;
  },

  // Update room rate
  updateRoomRate: async (id, rateData) => {
    const response = await api.put(`/room-rates/${id}`, rateData);
    return response.data;
  },

  // Delete room rate
  deleteRoomRate: async (id) => {
    const response = await api.delete(`/room-rates/${id}`);
    return response.data;
  },

  // Calculate price
  calculatePrice: async (roomId, checkIn, checkOut) => {
    const response = await api.get('/room-rates/calculate', {
      params: { room_id: roomId, check_in: checkIn, check_out: checkOut }
    });
    return response.data;
  },
};
