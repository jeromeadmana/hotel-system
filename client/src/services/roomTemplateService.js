import api from '../config/api';

export const roomTemplateService = {
  // Get all room templates (admin-only)
  getTemplates: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/room-templates?${params}`);
    return response.data;
  },

  // Get template by ID
  getTemplateById: async (id) => {
    const response = await api.get(`/room-templates/${id}`);
    return response.data;
  },

  // Create room template
  createTemplate: async (templateData) => {
    const response = await api.post('/room-templates', templateData);
    return response.data;
  },

  // Update room template
  updateTemplate: async (id, templateData, applyToRooms = false) => {
    const params = applyToRooms ? '?apply_to_rooms=true' : '';
    const response = await api.put(`/room-templates/${id}${params}`, templateData);
    return response.data;
  },

  // Sync template to rooms
  syncTemplateToRooms: async (id) => {
    const response = await api.post(`/room-templates/${id}/sync`);
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id) => {
    const response = await api.delete(`/room-templates/${id}`);
    return response.data;
  },

  // Get rooms created from template
  getRoomsByTemplate: async (id) => {
    const response = await api.get(`/room-templates/${id}/rooms`);
    return response.data;
  }
};
