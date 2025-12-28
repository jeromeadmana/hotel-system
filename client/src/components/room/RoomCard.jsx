import { Users, Maximize2, Bed, DollarSign, Edit, Trash2 } from 'lucide-react';

const RoomCard = ({ room, onEdit, onDelete, showActions = false }) => {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    cleaning: 'bg-blue-100 text-blue-800',
    reserved: 'bg-purple-100 text-purple-800',
  };

  const roomTypeLabels = {
    single: 'Single',
    double: 'Double',
    suite: 'Suite',
    deluxe: 'Deluxe',
    family: 'Family',
    executive: 'Executive',
  };

  const amenities = room.amenities ? JSON.parse(room.amenities) : [];

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-heading font-bold text-gray-900">
              Room {room.room_number}
            </h3>
            <p className="text-sm text-gray-600">{roomTypeLabels[room.room_type]}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[room.status]}`}>
            {room.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>Max {room.max_occupancy} guests</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Bed className="w-4 h-4 mr-2 text-gray-400" />
            <span>{room.bed_type || 'Standard bed'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Maximize2 className="w-4 h-4 mr-2 text-gray-400" />
            <span>{room.size_sqft ? `${room.size_sqft} sq ft` : 'Size not specified'}</span>
          </div>
          {room.base_price && (
            <div className="flex items-center text-sm font-semibold text-primary-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>${room.base_price}/night</span>
            </div>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => onEdit(room)}
              className="flex-1 btn-secondary text-sm py-2"
            >
              <Edit className="w-4 h-4 inline mr-1" />
              Edit
            </button>
            <button
              onClick={() => onDelete(room.id)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 inline" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
