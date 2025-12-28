import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, X, RefreshCw } from 'lucide-react';
import { roomTemplateService } from '../../services/roomTemplateService';

const EditTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [applyToRooms, setApplyToRooms] = useState(false);
  const [formData, setFormData] = useState({
    template_name: '',
    public_name: '',
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
    },
    is_active: true
  });
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await roomTemplateService.getTemplateById(id);
      const data = response.data.template;
      setTemplate(data);
      setFormData({
        template_name: data.template_name || '',
        public_name: data.public_name || '',
        description: data.description || '',
        long_description: data.long_description || '',
        max_occupancy: data.max_occupancy || 1,
        bed_type: data.bed_type || '',
        size_sqft: data.size_sqft || '',
        base_price: data.base_price || '',
        amenities: data.amenities || [],
        policies: data.policies || {
          check_in: '15:00',
          check_out: '11:00',
          smoking: false,
          pets: false
        },
        is_active: data.is_active !== undefined ? data.is_active : true
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load template');
      navigate('/staff/templates');
    } finally {
      setLoading(false);
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

  const handleSyncNow = async () => {
    try {
      setSaving(true);
      const response = await roomTemplateService.syncTemplateToRooms(id);
      toast.success(response.message || 'Template synced to rooms successfully!');
      setShowSyncModal(false);
    } catch (error) {
      console.error('Error syncing template:', error);
      toast.error(error.response?.data?.message || 'Failed to sync template');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.template_name || !formData.public_name) {
      toast.error('Template name and public name are required');
      return;
    }

    // If room count > 0, ask about syncing
    if (template.room_count > 0) {
      setShowSyncModal(true);
      return;
    }

    // No rooms, just update
    await submitUpdate(false);
  };

  const submitUpdate = async (syncToRooms) => {
    setSaving(true);
    try {
      const submitData = {
        ...formData,
        max_occupancy: parseInt(formData.max_occupancy),
        size_sqft: formData.size_sqft ? parseInt(formData.size_sqft) : null,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null
      };

      await roomTemplateService.updateTemplate(id, submitData, syncToRooms);
      toast.success(syncToRooms
        ? 'Template updated and synced to rooms!'
        : 'Template updated successfully!');
      setShowSyncModal(false);
      navigate('/staff/templates');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error(error.response?.data?.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-primary-500">Loading template...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-heading font-semibold text-primary">
                Edit Room Template
              </h1>
              <p className="text-primary-400 mt-2">
                {template?.template_code} • {template?.room_count || 0} rooms created
              </p>
            </div>
            {template?.room_count > 0 && (
              <button
                onClick={handleSyncNow}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </button>
            )}
          </div>
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

              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 text-accent focus:ring-accent rounded"
                  />
                  <label className="text-sm font-medium text-primary">
                    Template Active (can be used for new rooms)
                  </label>
                </div>
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
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Sync Confirmation Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-paper rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-primary">
                  Apply Changes to Existing Rooms?
                </h3>
                <p className="text-sm text-primary-400">
                  {template?.room_count || 0} rooms use this template
                </p>
              </div>
            </div>

            <p className="text-primary-600 mb-6">
              Do you want to apply these changes to all existing rooms created from this template?
              Only non-overridden fields will be updated.
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 p-4 bg-background rounded-xl cursor-pointer hover:bg-secondary-50 transition-colors">
                <input
                  type="radio"
                  name="syncOption"
                  checked={!applyToRooms}
                  onChange={() => setApplyToRooms(false)}
                  className="mt-1 w-5 h-5 text-accent focus:ring-accent"
                />
                <div>
                  <div className="font-medium text-primary">Apply to new rooms only</div>
                  <div className="text-sm text-primary-400">Existing rooms keep their current values</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-background rounded-xl cursor-pointer hover:bg-secondary-50 transition-colors">
                <input
                  type="radio"
                  name="syncOption"
                  checked={applyToRooms}
                  onChange={() => setApplyToRooms(true)}
                  className="mt-1 w-5 h-5 text-accent focus:ring-accent"
                />
                <div>
                  <div className="font-medium text-primary">Apply to all {template?.room_count} existing rooms</div>
                  <div className="text-sm text-primary-400">Update non-overridden fields in all rooms</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSyncModal(false)}
                className="flex-1 px-4 py-3 bg-secondary-100 hover:bg-secondary-200 text-primary rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => submitUpdate(applyToRooms)}
                disabled={saving}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTemplate;
