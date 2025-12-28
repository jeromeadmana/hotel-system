import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Home, MapPin } from 'lucide-react';
import { roomTemplateService } from '../../services/roomTemplateService';

const TemplateRooms = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templateRes, roomsRes] = await Promise.all([
        roomTemplateService.getTemplateById(id),
        roomTemplateService.getRoomsByTemplate(id)
      ]);
      setTemplate(templateRes.data.template);
      setRooms(roomsRes.data.rooms);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      navigate('/staff/templates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800',
      cleaning: 'bg-blue-100 text-blue-800',
      reserved: 'bg-purple-100 text-purple-800',
      out_of_service: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-primary-500">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background-paper border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/staff/templates')}
            className="flex items-center gap-2 text-primary-500 hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-secondary-200 rounded-lg text-xs font-mono text-primary-600">
                {template?.template_code}
              </span>
            </div>
            <h1 className="text-3xl font-heading font-semibold text-primary">
              {template?.public_name}
            </h1>
            <p className="text-primary-400 mt-2">
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} created from this template
            </p>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {rooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-100 rounded-full mb-6">
              <Home className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-primary mb-2">
              No Rooms Created Yet
            </h3>
            <p className="text-primary-400 mb-6">
              Create rooms from this template to see them here.
            </p>
            <button
              onClick={() => navigate('/staff/rooms/create')}
              className="btn-primary"
            >
              Create Room from Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-background-paper rounded-2xl shadow-elegant overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/staff/rooms/${room.id}`)}
              >
                {/* Room Header */}
                <div className="p-6 border-b border-secondary-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-primary text-lg">
                        Room {room.room_number}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-primary mb-2">
                    {room.public_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-primary-400">
                    <MapPin className="w-4 h-4" />
                    <span>Floor {room.floor_number || 'N/A'}</span>
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-6 bg-background space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Room Code:</span>
                    <span className="text-primary font-mono">{room.room_code}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Location:</span>
                    <span className="text-primary font-medium">{room.location_city}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Occupancy:</span>
                    <span className="text-primary font-medium">{room.max_occupancy} guests</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400">Bed Type:</span>
                    <span className="text-primary font-medium">{room.bed_type || 'N/A'}</span>
                  </div>
                  {room.base_price && (
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-secondary-200">
                      <span className="text-primary-400">Base Rate:</span>
                      <span className="text-accent font-semibold">
                        ${parseFloat(room.base_price).toFixed(2)}/night
                      </span>
                    </div>
                  )}
                </div>

                {/* Overrides Indicator */}
                {room.override_flags && Object.values(room.override_flags).some(v => v) && (
                  <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
                    <p className="text-xs text-blue-700">
                      Custom overrides applied
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateRooms;
