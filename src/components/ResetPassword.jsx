import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({ 
    loading: false, 
    error: '', 
    success: '',
    tokenValid: null 
  });

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus(prev => ({ ...prev, tokenValid: false }));
        return;
      }

      try {
        const response = await axios.post(
          'https://muterianc.pythonanywhere.com/api/validate-reset-token',
          { token },
          { headers: { 'Content-Type': 'application/json' } }
        );

        setStatus(prev => ({ 
          ...prev, 
          tokenValid: response.data.valid 
        }));

        if (!response.data.valid) {
          setStatus(prev => ({ 
            ...prev, 
            error: 'Invalid or expired reset token' 
          }));
        }
      } catch (err) {
        setStatus(prev => ({ 
          ...prev, 
          tokenValid: false,
          error: 'Failed to validate reset token' 
        }));
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = form;

    if (!password || !confirmPassword) {
      setStatus({ ...status, error: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ ...status, error: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setStatus({ ...status, error: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setStatus({ ...status, loading: true, error: '' });

      const response = await axios.post(
        'https://muterianc.pythonanywhere.com/api/reset-password',
        { token, password, confirm_password: confirmPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setStatus({ 
        loading: false, 
        error: '', 
        success: 'Password reset successfully! Redirecting to sign in...',
        tokenValid: true 
      });

      // Redirect to signin after 2 seconds
      setTimeout(() => navigate('/signin'), 2000);
      
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.error || 'Failed to reset password. Please try again.',
        success: ''
      });
    }
  };

  if (status.tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link 
              to="/forgot-password"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="p-8">
          {/* Back to Signin */}
          <Link 
            to="/signin" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-6"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to sign in
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Set New Password</h2>
            <p className="text-gray-600 mt-2">
              Create a new password for your account
            </p>
          </div>

          {/* Status Messages */}
          {status.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <div className="text-red-500 mr-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-700">{status.error}</span>
              </div>
            </div>
          )}

          {status.success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span className="text-green-700">{status.success}</span>
              </div>
            </div>
          )}

          {status.tokenValid === null && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />
                <span className="text-blue-700">Validating reset token...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                New Password
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
                  minLength="6"
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                  ) : (
                    <Eye className="text-gray-400 hover:text-gray-600" size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status.loading || status.tokenValid === null}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;