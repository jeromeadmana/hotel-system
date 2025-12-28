import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { roomService } from '../../../services/roomService';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location_id: 1,
    room_number: '',
    room_type: 'double',
    floor_number: '',
    max_occupancy: 2,
    bed_type: '',
    size_sqft: '',
    description: '',
    amenities: [],
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
        max_occupancy: parseInt(formData.max_occupancy),
        size_sqft: formData.size_sqft ? parseInt(formData.size_sqft) : null,
      };

      await roomService.createRoom(submitData);
      toast.success('Room created successfully');
      navigate('/staff/rooms');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/staff/rooms')}
            className="btn-secondary mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rooms
          </button>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Create New Room
          </h1>
          <p className="text-gray-600 mt-1">Add a new room to your inventory</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="card p-8">
          <div className="space-y-6">
            {/* Room Number & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="room_number"
                  required
                  className="input-field"
                  placeholder="e.g., 101"
                  value={formData.room_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="room_type"
                  required
                  className="input-field"
                  value={formData.room_type}
                  onChange={handleChange}
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="family">Family</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            {/* Floor & Occupancy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Number
                </label>
                <input
                  type="number"
                  name="floor_number"
                  className="input-field"
                  placeholder="e.g., 1"
                  value={formData.floor_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Occupancy <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="max_occupancy"
                  required
                  min="1"
                  className="input-field"
                  value={formData.max_occupancy}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Bed Type & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Type
                </label>
                <input
                  type="text"
                  name="bed_type"
                  className="input-field"
                  placeholder="e.g., King, Queen"
                  value={formData.bed_type}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size (sq ft)
                </label>
                <input
                  type="number"
                  name="size_sqft"
                  className="input-field"
                  placeholder="e.g., 350"
                  value={formData.size_sqft}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                className="input-field"
                placeholder="Describe the room..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., WiFi, TV, Minibar"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="btn-secondary"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/staff/rooms')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
