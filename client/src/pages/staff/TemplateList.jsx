import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, FileText, Layers, ArrowLeft } from 'lucide-react';
import { roomTemplateService } from '../../services/roomTemplateService';
import { useAuth } from '../../hooks/useAuth';

const TemplateList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await roomTemplateService.getTemplates();
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, templateCode) => {
    try {
      await roomTemplateService.deleteTemplate(id);
      toast.success('Template deleted successfully');
      fetchTemplates();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const getRoomTypeColor = (type) => {
    const colors = {
      single: 'bg-blue-100 text-blue-800',
      double: 'bg-green-100 text-green-800',
      suite: 'bg-purple-100 text-purple-800',
      deluxe: 'bg-gold-100 text-gold-800',
      family: 'bg-pink-100 text-pink-800',
      executive: 'bg-indigo-100 text-indigo-800',
      penthouse: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-primary-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background-paper border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/staff')}
                className="flex items-center gap-2 text-primary-500 hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Layers className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-semibold text-primary">
                    Room Templates
                  </h1>
                  <p className="text-sm text-primary-400 mt-1">
                    Manage room blueprints for your location
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/staff/templates/create')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Template
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-100 rounded-full mb-6">
              <Layers className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-primary mb-2">
              No Templates Yet
            </h3>
            <p className="text-primary-400 mb-6 max-w-md mx-auto">
              Create your first room template to standardize room creation and streamline management.
            </p>
            <button
              onClick={() => navigate('/staff/templates/create')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-background-paper rounded-2xl shadow-elegant overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Template Header */}
                <div className="p-6 border-b border-secondary-200">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getRoomTypeColor(template.room_type)}`}>
                      {template.room_type}
                    </span>
                    <span className="text-xs text-primary-400 font-mono">
                      {template.template_code}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                    {template.public_name}
                  </h3>
                  <p className="text-sm text-primary-500 line-clamp-2">
                    {template.description || 'No description'}
                  </p>
                </div>

                {/* Template Details */}
                <div className="p-6 bg-background space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Location:</span>
                    <span className="text-primary font-medium">{template.location_city}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Occupancy:</span>
                    <span className="text-primary font-medium">{template.max_occupancy} guests</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Bed Type:</span>
                    <span className="text-primary font-medium">{template.bed_type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Base Price:</span>
                    <span className="text-accent font-semibold">
                      ${template.base_price ? parseFloat(template.base_price).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Rooms Created:</span>
                    <span className="text-primary font-medium">{template.room_count || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-secondary-50 border-t border-secondary-200 flex gap-2">
                  <button
                    onClick={() => navigate(`/staff/templates/${template.id}/rooms`)}
                    className="flex-1 px-4 py-2 bg-background-paper hover:bg-secondary-100 text-primary-600 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Rooms
                  </button>
                  <button
                    onClick={() => navigate(`/staff/templates/${template.id}/edit`)}
                    className="flex-1 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {template.room_count === 0 && (
                    <button
                      onClick={() => setDeleteConfirm(template)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-paper rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-primary">
                  Delete Template
                </h3>
                <p className="text-sm text-primary-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-primary-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.public_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-secondary-100 hover:bg-secondary-200 text-primary rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.template_code)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateList;
