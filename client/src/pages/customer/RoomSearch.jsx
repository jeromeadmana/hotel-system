import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Calendar, Filter, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { roomService } from '../../services/roomService';
import RoomCard from '../../components/room/RoomCard';

const RoomSearch = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    room_type: '',
    min_occupancy: '',
    status: 'available',
  });
  const [searchDates, setSearchDates] = useState({
    checkIn: '',
    checkOut: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, [filters]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRooms(filters);
      setRooms(response.data.rooms);
    } catch (error) {
      toast.error('Failed to load rooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSearchDates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookRoom = (room) => {
    // Navigate to booking page with room and date info
    const queryParams = new URLSearchParams({
      roomId: room.id,
      ...(searchDates.checkIn && { checkIn: searchDates.checkIn }),
      ...(searchDates.checkOut && { checkOut: searchDates.checkOut })
    });
    navigate(`/book?${queryParams.toString()}`);
  };

  const filteredRooms = rooms.filter(room => {
    // Additional client-side filtering if needed
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Find Your Perfect Room
          </h1>
          <p className="text-xl text-gray-100">
            Book your stay with us and enjoy luxury accommodations
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-in Date
              </label>
              <input
                type="date"
                name="checkIn"
                className="input-field"
                value={searchDates.checkIn}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-out Date
              </label>
              <input
                type="date"
                name="checkOut"
                className="input-field"
                value={searchDates.checkOut}
                onChange={handleDateChange}
                min={searchDates.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="inline w-4 h-4 mr-1" />
                Guests
              </label>
              <select
                name="min_occupancy"
                className="input-field"
                value={filters.min_occupancy}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline w-4 h-4 mr-1" />
                Room Type
              </label>
              <select
                name="room_type"
                className="input-field"
                value={filters.room_type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe</option>
                <option value="family">Family</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold text-gray-900">
            Available Rooms ({filteredRooms.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No rooms found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <div key={room.id}>
                <RoomCard room={room} />
                <button
                  onClick={() => handleBookRoom(room)}
                  className="btn-primary w-full mt-4"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSearch;
