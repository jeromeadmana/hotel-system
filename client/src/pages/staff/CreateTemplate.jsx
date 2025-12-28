import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { roomTemplateService } from '../../services/roomTemplateService';
import api from '../../config/api';

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location_id: '',
    template_name: '',
    public_name: '',
    room_type: 'single',
    description: '',
    long_description: '',
    max_occupancy: 1,
    bed_type: '',
    size_sqft: '',
    base_price: '',
    amenities: [],
    policies: {
      check_in: '15:00',
      check_out: '11:00',
      smoking: false,
      pets: false
    }
  });
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data.data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('policy_')) {
      const policyKey = name.replace('policy_', '');
      setFormData(prev => ({
        ...prev,
        policies: {
          ...prev.policies,
          [policyKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location_id) {
      toast.error('Please select a location');
      return;
    }

    if (!formData.template_name || !formData.public_name) {
      toast.error('Template name and public name are required');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        max_occupancy: parseInt(formData.max_occupancy),
        size_sqft: formData.size_sqft ? parseInt(formData.size_sqft) : null,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null
      };

      await roomTemplateService.createTemplate(submitData);
      toast.success('Template created successfully!');
      navigate('/staff/templates');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error(error.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background-paper border-b border-secondary-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/staff/templates')}
            className="flex items-center gap-2 text-primary-500 hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </button>
          <h1 className="text-3xl font-heading font-semibold text-primary">
            Create Room Template
          </h1>
          <p className="text-primary-400 mt-2">
            Create a blueprint for standardized room creation
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-background-paper rounded-2xl shadow-elegant p-6">
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="family">Family</option>
                  <option value="executive">Executive</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Internal Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="template_name"
                  value={formData.template_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Deluxe City View Template"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Public Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="public_name"
                  value={formData.public_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Deluxe City View Suite"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Max Occupancy <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="max_occupancy"
                  value={formData.max_occupancy}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Bed Type
                </label>
                <input
                  type="text"
                  name="bed_type"
                  value={formData.bed_type}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., King, Two Queens"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Size (sq ft)
                </label>
                <input
                  type="number"
                  name="size_sqft"
                  value={formData.size_sqft}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  placeholder="e.g., 450"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Base Price ($)
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 249.99"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-background-paper rounded-2xl shadow-elegant p-6">
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">
              Description
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Short Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  rows="2"
                  placeholder="Brief description for listings..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Long Description
                </label>
                <textarea
                  name="long_description"
                  value={formData.long_description}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                  placeholder="Detailed marketing description..."
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-background-paper rounded-2xl shadow-elegant p-6">
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">
              Amenities
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                className="input-field flex-1"
                placeholder="Add amenity (e.g., WiFi, Smart TV)"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-secondary-100 text-primary rounded-lg text-sm"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="text-primary-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {formData.amenities.length === 0 && (
                <p className="text-primary-400 text-sm">No amenities added yet</p>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="bg-background-paper rounded-2xl shadow-elegant p-6">
            <h2 className="text-xl font-heading font-semibold text-primary mb-6">
              Policies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  name="policy_check_in"
                  value={formData.policies.check_in}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  name="policy_check_out"
                  value={formData.policies.check_out}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="policy_smoking"
                  checked={formData.policies.smoking}
                  onChange={handleChange}
                  className="w-5 h-5 text-accent focus:ring-accent rounded"
                />
                <label className="text-sm font-medium text-primary">
                  Smoking Allowed
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="policy_pets"
                  checked={formData.policies.pets}
                  onChange={handleChange}
                  className="w-5 h-5 text-accent focus:ring-accent rounded"
                />
                <label className="text-sm font-medium text-primary">
                  Pets Allowed
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/staff/templates')}
              className="flex-1 px-6 py-3 bg-secondary-100 hover:bg-secondary-200 text-primary rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplate;
