import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Hotel, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    { role: 'Super Admin', email: 'superadmin@hotel.com', color: 'purple' },
    { role: 'Admin', email: 'admin.ny@hotel.com', color: 'blue' },
    { role: 'Staff', email: 'staff.ny@hotel.com', color: 'green' },
    { role: 'Customer', email: 'customer@example.com', color: 'pink' }
  ];

  const quickLogin = (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark to-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 text-white max-w-md">
          <Hotel className="w-20 h-20 mb-6" />
          <h1 className="text-5xl font-heading font-bold mb-4">
            Hotel Management System
          </h1>
          <p className="text-xl text-gray-100 mb-8">
            Streamline your hotel operations with our comprehensive management platform
          </p>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-gray-200">Hotels Worldwide</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <p className="text-3xl font-bold">99.9%</p>
              <p className="text-sm text-gray-200">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <Hotel className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-white">Hotel Management</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600">
                Sign in to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Browse Rooms Link */}
            <div className="mt-4 text-center">
              <Link to="/rooms" className="text-sm text-gray-500 hover:text-gray-700">
                Or browse available rooms →
              </Link>
            </div>
          </div>

          {/* Test Accounts */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Access (Test Accounts)</h3>
            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => quickLogin(account.email)}
                  className={`text-left p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm border border-white/30`}
                >
                  <p className="text-xs font-semibold text-white">{account.role}</p>
                  <p className="text-xs text-gray-200 truncate">{account.email}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-300 mt-3 text-center">
              Password: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
