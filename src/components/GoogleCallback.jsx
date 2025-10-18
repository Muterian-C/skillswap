import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Extract the authorization code from URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (code) {
          // Send the code to your backend to exchange for tokens
          const response = await axios.get(`https://muterianc.pythonanywhere.com/auth/google/callback?code=${code}`);
          
          if (response.data.success && response.data.token) {
            // Login the user with the received token
            login(response.data.user, response.data.token);
            navigate('/'); // Redirect to home page
          } else {
            throw new Error('Google authentication failed');
          }
        } else {
          throw new Error('No authorization code received');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
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