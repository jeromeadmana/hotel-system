import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-heading font-bold">Staff Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user?.role)}`}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="bg-white text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card p-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
              Staff Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to the staff portal. Manage bookings, rooms, and guests from here.
            </p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-indigo-900 mb-2">Staff Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-indigo-700">Name:</dt>
                  <dd className="text-sm text-indigo-900">{user?.firstName} {user?.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-indigo-700">Email:</dt>
                  <dd className="text-sm text-indigo-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-indigo-700">Role:</dt>
                  <dd className="text-sm text-indigo-900">{user?.role?.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-indigo-700">Location ID:</dt>
                  <dd className="text-sm text-indigo-900">{user?.locationId || 'All Locations'}</dd>
                </div>
              </dl>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card p-6 bg-blue-50 border border-blue-200">
                <h3 className="text-3xl font-bold text-blue-900">24</h3>
                <p className="text-sm text-blue-700">Total Bookings</p>
              </div>
              <div className="card p-6 bg-green-50 border border-green-200">
                <h3 className="text-3xl font-bold text-green-900">12</h3>
                <p className="text-sm text-green-700">Check-ins Today</p>
              </div>
              <div className="card p-6 bg-yellow-50 border border-yellow-200">
                <h3 className="text-3xl font-bold text-yellow-900">8</h3>
                <p className="text-sm text-yellow-700">Pending Bookings</p>
              </div>
              <div className="card p-6 bg-purple-50 border border-purple-200">
                <h3 className="text-3xl font-bold text-purple-900">45</h3>
                <p className="text-sm text-purple-700">Available Rooms</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="card p-4 hover:shadow-lg transition-shadow text-left">
                  <p className="font-medium text-gray-900">Manage Bookings</p>
                  <p className="text-sm text-gray-500">View and confirm reservations</p>
                </button>
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <button
                    onClick={() => navigate('/staff/rooms')}
                    className="card p-4 hover:shadow-lg transition-shadow text-left"
                  >
                    <p className="font-medium text-gray-900">Manage Rooms</p>
                    <p className="text-sm text-gray-500">Add and edit room information</p>
                  </button>
                )}
                <button className="card p-4 hover:shadow-lg transition-shadow text-left">
                  <p className="font-medium text-gray-900">Check-in/Check-out</p>
                  <p className="text-sm text-gray-500">Process guest arrivals</p>
                </button>
                <button className="card p-4 hover:shadow-lg transition-shadow text-left">
                  <p className="font-medium text-gray-900">Housekeeping</p>
                  <p className="text-sm text-gray-500">Manage cleaning tasks</p>
                </button>
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <button className="card p-4 hover:shadow-lg transition-shadow text-left">
                    <p className="font-medium text-gray-900">Reports</p>
                    <p className="text-sm text-gray-500">View analytics and stats</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
