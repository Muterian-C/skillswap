import React, { useState, useEffect } from 'react';
import { Coins, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BuyCreditsModal from './BuyCreditsModal';

const CreditBalance = ({ showBuyButton = false, size = 'md' }) => {
  const { token } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://muterianc.pythonanywhere.com/api/user/credits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCredits(response.data.credits);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCredits();
    }
  }, [token]);

  const handleBuyCredits = () => {
    setIsModalOpen(true);
  };

  const handleCreditsPurchased = (newBalance) => {
    setCredits(newBalance);
    fetchCredits(); // Refresh to be sure
  };

  // Size variants
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className={sizeClasses[size]}>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <Coins className="h-4 w-4" />
        <span className={sizeClasses[size]}>Error</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-100">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className={`font-semibold text-gray-800 ${sizeClasses[size]}`}>
            {credits.toLocaleString()} credits
          </span>
        </div>
        
        {showBuyButton && (
          <button
            onClick={handleBuyCredits}
            className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Buy</span>
          </button>
        )}
      </div>

      <BuyCreditsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreditsPurchased={handleCreditsPurchased}
      />
    </>
  );
};

export default CreditBalance;