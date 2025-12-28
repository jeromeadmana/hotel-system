import { Users, Maximize2, Bed, DollarSign, Edit, Trash2 } from 'lucide-react';

const RoomCard = ({ room, onEdit, onDelete, showActions = false }) => {
  const statusColors = {
    available: 'bg-teal-50 text-teal-700 border border-teal-200',
    occupied: 'bg-red-50 text-red-700 border border-red-200',
    maintenance: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    cleaning: 'bg-blue-50 text-blue-700 border border-blue-200',
    reserved: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  const roomTypeLabels = {
    single: 'Single',
    double: 'Double',
    suite: 'Suite',
    deluxe: 'Deluxe',
    family: 'Family',
    executive: 'Executive',
  };

  const amenities = room.amenities
    ? (typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities)
    : [];

  return (
    <div className="bg-background-paper rounded-2xl shadow-elegant hover:shadow-lg transition-all duration-300 border border-secondary-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-2xl font-heading font-semibold text-primary mb-1">
              Room {room.room_number}
            </h3>
            <p className="text-sm text-primary-400 font-medium">{roomTypeLabels[room.room_type]}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusColors[room.status]}`}>
            {room.status}
          </span>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-primary-500 mb-5 leading-relaxed line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center text-sm text-primary-600">
            <Users className="w-4 h-4 mr-3 text-primary-300" />
            <span>Up to {room.max_occupancy} guests</span>
          </div>
          <div className="flex items-center text-sm text-primary-600">
            <Bed className="w-4 h-4 mr-3 text-primary-300" />
            <span>{room.bed_type || 'Standard bed'}</span>
          </div>
          <div className="flex items-center text-sm text-primary-600">
            <Maximize2 className="w-4 h-4 mr-3 text-primary-300" />
            <span>{room.size_sqft ? `${room.size_sqft} sq ft` : 'Size not specified'}</span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-5 pt-5 border-t border-secondary-200">
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary-100 text-primary-600 text-xs rounded-lg font-medium"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 4 && (
                <span className="px-3 py-1 bg-accent/10 text-accent-dark text-xs rounded-lg font-medium">
                  +{amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        {room.base_price && (
          <div className="pt-5 border-t border-secondary-200">
            <div className="flex items-baseline gap-1">
              <DollarSign className="w-5 h-5 text-accent" />
              <span className="text-3xl font-heading font-semibold text-accent">{room.base_price}</span>
              <span className="text-sm text-primary-400 ml-1">per night</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-5 mt-5 border-t border-secondary-200">
            <button
              onClick={() => onEdit(room)}
              className="flex-1 bg-secondary-100 hover:bg-secondary-200 text-primary-700 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(room.id)}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-medium transition-all border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
