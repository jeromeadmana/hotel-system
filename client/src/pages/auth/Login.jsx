import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Hotel, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'customer') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/staff/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome back!');

      // Redirect based on role
      if (result.user.role === 'customer') {
        navigate('/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
    } else {
      toast.error(result.message || 'Login failed');
    }

    setLoading(false);
  };

  const testAccounts = [
    { role: 'Super Admin', email: 'superadmin@hotel.com' },
    { role: 'Admin', email: 'admin.ny@hotel.com' },
    { role: 'Staff', email: 'staff.ny@hotel.com' },
    { role: 'Customer', email: 'customer@example.com' }
  ];

  const quickLogin = (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                to="/rooms"
                className="text-primary-500 hover:text-accent font-medium transition-colors"
              >
                Browse Rooms
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

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Hotel Branding */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
              <Hotel className="w-9 h-9 text-accent" />
            </div>
            <h1 className="text-4xl font-heading font-semibold text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-primary-400 text-lg">
              Sign in to manage your bookings
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-background-paper rounded-2xl shadow-elegant p-8 border border-secondary-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-600 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-primary-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-background border border-secondary-300 rounded-xl text-primary placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full pl-11 pr-11 py-3 bg-background border border-secondary-300 rounded-xl text-primary placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-primary-300 hover:text-primary-500 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary-300 hover:text-primary-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-accent focus:ring-accent border-secondary-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-primary-500">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-accent hover:text-accent-dark transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl font-medium text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-primary-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-accent hover:text-accent-dark transition-colors">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Browse Rooms Link */}
            <div className="mt-4 text-center">
              <Link to="/rooms" className="text-sm text-primary-300 hover:text-primary-500 transition-colors">
                Browse available rooms
              </Link>
            </div>
          </div>

          {/* Test Accounts Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="text-xs text-primary-300 hover:text-primary-500 transition-colors"
            >
              {showTestAccounts ? 'Hide' : 'Show'} test accounts
            </button>
          </div>

          {/* Test Accounts */}
          {showTestAccounts && (
            <div className="mt-4 bg-background-paper rounded-xl shadow-sm p-5 border border-secondary-200 animate-fade-in">
              <h3 className="text-xs font-semibold text-primary-500 mb-3 uppercase tracking-wide">Quick Access</h3>
              <div className="grid grid-cols-2 gap-2">
                {testAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => quickLogin(account.email)}
                    className="text-left p-3 bg-background hover:bg-secondary-100 rounded-lg transition-colors border border-secondary-200"
                  >
                    <p className="text-xs font-semibold text-primary-600">{account.role}</p>
                    <p className="text-xs text-primary-400 truncate">{account.email}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-primary-300 mt-3 text-center">
                Password: password123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
