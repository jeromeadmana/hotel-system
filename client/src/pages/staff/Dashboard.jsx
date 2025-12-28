import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Hotel,
  ClipboardList,
  BarChart3,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  DoorOpen
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 24,
    todayCheckIns: 12,
    pendingBookings: 8,
    availableRooms: 45
  });

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      admin: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      staff: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    };
    return badges[role] || 'bg-gray-500 text-white';
  };

  const quickActions = [
    {
      title: 'Manage Bookings',
      description: 'View and manage all reservations',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      onClick: () => {},
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      title: 'Manage Rooms',
      description: 'Add and edit room information',
      icon: Hotel,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/staff/rooms'),
      roles: ['admin', 'super_admin']
    },
    {
      title: 'Check-in / Check-out',
      description: 'Process guest arrivals and departures',
      icon: DoorOpen,
      color: 'from-green-500 to-green-600',
      onClick: () => {},
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      title: 'Housekeeping',
      description: 'Manage cleaning and maintenance tasks',
      icon: ClipboardList,
      color: 'from-yellow-500 to-yellow-600',
      onClick: () => {},
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      title: 'Reports & Analytics',
      description: 'View performance metrics and insights',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      onClick: () => {},
      roles: ['admin', 'super_admin']
    },
    {
      title: 'Guest Management',
      description: 'Manage guest profiles and history',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
      onClick: () => {},
      roles: ['staff', 'admin', 'super_admin']
    }
  ];

  const filteredActions = quickActions.filter(action =>
    action.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Hotel className="w-8 h-8 text-primary mr-3" />
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Staff Portal</h1>
                <p className="text-xs text-gray-500">Hotel Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-xs font-semibold shadow-md ${getRoleBadge(user?.role)}`}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your hotel today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-10 h-10 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalBookings}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
            <p className="text-xs text-gray-400 mt-1">Active reservations</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.todayCheckIns}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Check-ins Today</p>
            <p className="text-xs text-gray-400 mt-1">Arrivals scheduled</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-10 h-10 text-yellow-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting confirmation</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Hotel className="w-10 h-10 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.availableRooms}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Available Rooms</p>
            <p className="text-xs text-gray-400 mt-1">Ready for booking</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 text-left overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.color} opacity-10 rounded-bl-full`}></div>
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-primary hover:text-primary-dark font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New booking confirmed</p>
                  <p className="text-xs text-gray-500">Room 201 - Suite</p>
                </div>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
