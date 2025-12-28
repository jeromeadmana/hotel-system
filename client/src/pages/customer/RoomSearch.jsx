import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Users, Calendar, Filter, MapPin, Hotel } from 'lucide-react';
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
    const queryParams = new URLSearchParams({
      roomId: room.id,
      ...(searchDates.checkIn && { checkIn: searchDates.checkIn }),
      ...(searchDates.checkOut && { checkOut: searchDates.checkOut })
    });
    navigate(`/book?${queryParams.toString()}`);
  };

  const filteredRooms = rooms.filter(room => {
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-background-paper border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Hotel className="w-8 h-8 text-accent" />
              <span className="text-xl font-heading font-semibold text-primary">Grand Hotel</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-primary-500 hover:text-accent font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-primary text-secondary-50 py-16 border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-heading font-semibold mb-4">
            Discover Your Perfect Stay
          </h1>
          <p className="text-xl text-secondary-100">
            Experience luxury and comfort in our carefully curated rooms
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-10">
        <div className="bg-background-paper rounded-2xl shadow-elegant p-8 border border-secondary-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-600 mb-2">
                Check-in Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-primary-300" />
                </div>
                <input
                  type="date"
                  name="checkIn"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-secondary-300 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  value={searchDates.checkIn}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-600 mb-2">
                Check-out Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-primary-300" />
                </div>
                <input
                  type="date"
                  name="checkOut"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-secondary-300 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  value={searchDates.checkOut}
                  onChange={handleDateChange}
                  min={searchDates.checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-600 mb-2">
                Guests
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-primary-300" />
                </div>
                <select
                  name="min_occupancy"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-secondary-300 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-600 mb-2">
                Room Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-primary-300" />
                </div>
                <select
                  name="room_type"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-secondary-300 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
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
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-heading font-semibold text-primary">
            Available Rooms <span className="text-primary-400">({filteredRooms.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-accent border-t-transparent"></div>
            <p className="mt-4 text-primary-400">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-100 rounded-full mb-6">
              <MapPin className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-primary mb-2">
              No Rooms Available
            </h3>
            <p className="text-primary-400">
              Please try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map(room => (
              <div key={room.id} className="flex flex-col">
                <RoomCard room={room} />
                <button
                  onClick={() => handleBookRoom(room)}
                  className="mt-4 w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
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
