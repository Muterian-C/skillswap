import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ⬅️ import context

const Signin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ⬅️ get login function from context

  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email || !password) {
      setStatus({ ...status, error: "Please enter email and password" });
      return;
    }

    try {
      setStatus({ loading: true, error: '' });

      // Flask expects form-data
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const res = await axios.post("https://muterianc.pythonanywhere.com//api/login", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.token) {
        // ✅ Use AuthContext login instead of localStorage
        login(res.data.user, res.data.token);

        // Redirect to profile
        navigate("/");
      } else {
        throw new Error("Authentication failed - no token received");
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.error || err.message || "Signin failed. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {status.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <span className="text-red-700">{status.error}</span>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                  ) : (
                    <Eye className="text-gray-400 hover:text-gray-600" size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={status.loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {status.loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/signup"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
