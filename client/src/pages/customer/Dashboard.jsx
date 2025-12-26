import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-heading font-bold text-primary-600">Hotel System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="btn-secondary text-sm"
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
              Welcome back, {user?.firstName}!
            </h2>
            <p className="text-gray-600 mb-6">
              This is your customer dashboard. You can manage your bookings and profile here.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">User Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-blue-700">Email:</dt>
                  <dd className="text-sm text-blue-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-blue-700">Role:</dt>
                  <dd className="text-sm text-blue-900">{user?.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-blue-700">User ID:</dt>
                  <dd className="text-sm text-blue-900">{user?.id}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="card p-4 hover:shadow-lg transition-shadow">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Browse Rooms</p>
                    <p className="text-sm text-gray-500">Find your perfect stay</p>
                  </div>
                </button>
                <button className="card p-4 hover:shadow-lg transition-shadow">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">My Bookings</p>
                    <p className="text-sm text-gray-500">View your reservations</p>
                  </div>
                </button>
                <button className="card p-4 hover:shadow-lg transition-shadow">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">My Profile</p>
                    <p className="text-sm text-gray-500">Update your information</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
