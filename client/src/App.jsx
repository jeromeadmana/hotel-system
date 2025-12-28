import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/customer/Dashboard';
import RoomSearch from './pages/customer/RoomSearch';
import BookingCheckout from './pages/customer/BookingCheckout';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import StaffDashboard from './pages/staff/Dashboard';
import RoomList from './pages/staff/rooms/RoomList';
import CreateRoom from './pages/staff/rooms/CreateRoom';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rooms" element={<RoomSearch />} />
      <Route path="/book" element={<BookingCheckout />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />

      {/* Customer Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin', 'super_admin']}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/rooms"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin', 'super_admin']}>
            <RoomList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/rooms/create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <CreateRoom />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/rooms" replace />} />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
              <p className="text-lg text-gray-600 mb-4">Access Denied</p>
              <a href="/login" className="btn-primary">
                Go to Login
              </a>
            </div>
          </div>
        }
      />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-lg text-gray-600 mb-4">Page Not Found</p>
              <a href="/" className="btn-primary">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
