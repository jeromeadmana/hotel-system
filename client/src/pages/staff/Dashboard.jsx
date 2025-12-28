import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
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
  DoorOpen,
  LayoutDashboard,
  Settings,
  Bell
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState({
    totalBookings: 24,
    todayCheckIns: 12,
    pendingBookings: 8,
    availableRooms: 45
  });

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: 'bg-purple-50 text-purple-700 border border-purple-200',
      admin: 'bg-blue-50 text-blue-700 border border-blue-200',
      staff: 'bg-teal-50 text-teal-700 border border-teal-200',
    };
    return badges[role] || 'bg-secondary-100 text-primary-600 border border-secondary-200';
  };

  const getRoleDisplay = (role) => {
    const displays = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      staff: 'Staff',
    };
    return displays[role] || role;
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => setActivePage('dashboard'),
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      onClick: () => setActivePage('bookings'),
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      id: 'rooms',
      label: 'Rooms',
      icon: Hotel,
      onClick: () => navigate('/staff/rooms'),
      roles: ['admin', 'super_admin']
    },
    {
      id: 'checkin',
      label: 'Check-in/out',
      icon: DoorOpen,
      onClick: () => setActivePage('checkin'),
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      id: 'housekeeping',
      label: 'Housekeeping',
      icon: ClipboardList,
      onClick: () => setActivePage('housekeeping'),
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      id: 'guests',
      label: 'Guests',
      icon: Users,
      onClick: () => setActivePage('guests'),
      roles: ['staff', 'admin', 'super_admin']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      onClick: () => setActivePage('reports'),
      roles: ['admin', 'super_admin']
    },
  ];

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-primary border-r border-primary-800 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-semibold text-white">Grand Hotel</h1>
              <p className="text-xs text-secondary-200">Staff Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-md'
                    : 'text-secondary-200 hover:bg-primary-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-primary-800">
          <div className="bg-primary-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-accent font-semibold text-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-secondary-200 truncate">{user?.email}</p>
              </div>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${getRoleBadge(user?.role)}`}>
              {getRoleDisplay(user?.role)}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-background-paper border-b border-secondary-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-heading font-semibold text-primary">
                Dashboard
              </h2>
              <p className="text-sm text-primary-400 mt-1">
                Welcome back, {user?.first_name}! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-secondary-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-primary-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-secondary-100 rounded-xl transition-colors">
                <Settings className="w-5 h-5 text-primary-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-background-paper rounded-2xl shadow-elegant p-6 border border-secondary-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-heading font-semibold text-primary">{stats.totalBookings}</span>
              </div>
              <p className="text-sm font-medium text-primary-600 mb-1">Total Bookings</p>
              <p className="text-xs text-primary-400">Active reservations</p>
            </div>

            <div className="bg-background-paper rounded-2xl shadow-elegant p-6 border border-secondary-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <span className="text-3xl font-heading font-semibold text-primary">{stats.todayCheckIns}</span>
              </div>
              <p className="text-sm font-medium text-primary-600 mb-1">Check-ins Today</p>
              <p className="text-xs text-primary-400">Arrivals scheduled</p>
            </div>

            <div className="bg-background-paper rounded-2xl shadow-elegant p-6 border border-secondary-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-3xl font-heading font-semibold text-primary">{stats.pendingBookings}</span>
              </div>
              <p className="text-sm font-medium text-primary-600 mb-1">Pending Bookings</p>
              <p className="text-xs text-primary-400">Awaiting confirmation</p>
            </div>

            <div className="bg-background-paper rounded-2xl shadow-elegant p-6 border border-secondary-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Hotel className="w-6 h-6 text-accent" />
                </div>
                <span className="text-3xl font-heading font-semibold text-primary">{stats.availableRooms}</span>
              </div>
              <p className="text-sm font-medium text-primary-600 mb-1">Available Rooms</p>
              <p className="text-xs text-primary-400">Ready for booking</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-background-paper rounded-2xl shadow-elegant p-6 border border-secondary-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-heading font-semibold text-primary">Recent Activity</h3>
              <button className="text-sm text-accent hover:text-accent-dark font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {[
                { action: 'New booking confirmed', detail: 'Room 201 - Suite', time: '2 min ago', icon: Calendar, color: 'blue' },
                { action: 'Check-in completed', detail: 'Room 105 - Deluxe', time: '15 min ago', icon: CheckCircle, color: 'teal' },
                { action: 'Housekeeping completed', detail: 'Room 304 - Family', time: '1 hour ago', icon: ClipboardList, color: 'yellow' }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-background hover:bg-secondary-50 rounded-xl transition-colors">
                    <div className={`w-10 h-10 bg-${item.color}-50 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${item.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-700">{item.action}</p>
                      <p className="text-xs text-primary-400">{item.detail}</p>
                    </div>
                    <span className="text-xs text-primary-300">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
