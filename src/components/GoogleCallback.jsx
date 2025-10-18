import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const error = urlParams.get('error');
        
        if (error) {
          // Handle error from backend
          const errorMessages = {
            'access_denied': 'You denied access to Google Sign-In',
            'no_code': 'No authorization code received',
            'no_id_token': 'Failed to get ID token from Google',
            'invalid_token': 'Invalid Google token',
            'auth_failed': 'Authentication failed. Please try again.'
          };
          
          navigate('/signin', { 
            state: { error: errorMessages[error] || 'Google authentication failed' } 
          });
          return;
        }

        const token = urlParams.get('token');
        const userParam = urlParams.get('user');

        if (token && userParam) {
          // Decode user data
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Login the user
          login(userData, token);
          
          // Redirect to home page
          navigate('/', { replace: true });
        } else {
          throw new Error('Missing authentication data');
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        navigate('/signin', { 
          state: { error: 'Google authentication failed. Please try again.' } 
        });
      }
    };

    handleGoogleCallback();
  }, [location, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Completing Sign In</h2>
          <p className="text-gray-600">Please wait while we sign you in with Google...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;