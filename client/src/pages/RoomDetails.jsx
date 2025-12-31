import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Users,
  Bed,
  Maximize,
  MapPin,
  Check,
  Calendar,
  DollarSign,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Loader2
} from 'lucide-react';
import roomService from '../services/roomService';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRoomById(id);
      setRoom(response.data.room);
    } catch (error) {
      console.error('Error fetching room details:', error);
      toast.error('Failed to load room details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate(`/booking/checkout/${id}`);
  };

  const amenityIcons = {
    'WiFi': Wifi,
    'Smart TV': Tv,
    'TV': Tv,
    'Air Conditioning': Wind,
    'Coffee Maker': Coffee,
  };

  const getAmenityIcon = (amenity) => {
    const Icon = amenityIcons[amenity] || Check;
    return Icon;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary-400">Room not found</p>
      </div>
    );
  }

  const images = room.images || [];
  const amenities = room.amenities || [];
  const policies = room.policies || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="bg-background-paper border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Search</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-secondary-100 h-96 mb-4">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]?.url || '/placeholder-room.jpg'}
                alt={room.public_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Hotel className="w-20 h-20 text-secondary-300" />
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative rounded-xl overflow-hidden h-24 border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-accent'
                      : 'border-transparent hover:border-secondary-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Room image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <div>
              <h1 className="text-4xl font-heading font-semibold text-primary mb-2">
                {room.public_name}
              </h1>
              <div className="flex items-center gap-2 text-primary-400">
                <MapPin className="w-4 h-4" />
                <span>{room.location_name}, {room.location_city}</span>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-primary-600">Up to {room.max_occupancy} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-accent" />
                <span className="text-primary-600">{room.bed_type}</span>
              </div>
              {room.size_sqft && (
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-accent" />
                  <span className="text-primary-600">{room.size_sqft} sq ft</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="border-t border-secondary-200 pt-6">
              <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
                About this room
              </h2>
              <p className="text-primary-600 leading-relaxed">
                {room.long_description || room.description || 'A comfortable and well-appointed room designed for your perfect stay.'}
              </p>
            </div>

            {/* Amenities */}
            <div className="border-t border-secondary-200 pt-6">
              <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-3 text-primary-600">
                      <Icon className="w-5 h-5 text-accent" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            {Object.keys(policies).length > 0 && (
              <div className="border-t border-secondary-200 pt-6">
                <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
                  Policies
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {policies.check_in && (
                    <div>
                      <p className="text-sm text-primary-400 mb-1">Check-in</p>
                      <p className="text-primary-700 font-medium">{policies.check_in}</p>
                    </div>
                  )}
                  {policies.check_out && (
                    <div>
                      <p className="text-sm text-primary-400 mb-1">Check-out</p>
                      <p className="text-primary-700 font-medium">{policies.check_out}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-primary-400 mb-1">Smoking</p>
                    <p className="text-primary-700 font-medium">
                      {policies.smoking ? 'Allowed' : 'Not allowed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-400 mb-1">Pets</p>
                    <p className="text-primary-700 font-medium">
                      {policies.pets ? 'Allowed' : 'Not allowed'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-background-paper rounded-2xl shadow-elegant border border-secondary-200 p-6 sticky top-24">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-secondary-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-heading font-semibold text-primary">
                    ${room.base_price}
                  </span>
                  <span className="text-primary-400">/ night</span>
                </div>
              </div>

              {/* Room Code */}
              <div className="mb-6">
                <p className="text-sm text-primary-400 mb-1">Room Number</p>
                <p className="text-lg font-medium text-primary">{room.room_number}</p>
              </div>

              {/* Status */}
              <div className="mb-6">
                <p className="text-sm text-primary-400 mb-2">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${
                  room.status === 'available'
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {room.status === 'available' ? 'Available' : room.status}
                </span>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={room.status !== 'available'}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-5 h-5" />
                Book Now
              </button>

              {/* Info */}
              <p className="text-xs text-primary-400 text-center mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoomDetails;
