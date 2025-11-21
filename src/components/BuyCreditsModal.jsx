import React, { useState } from 'react';
import { X, Coins, Check, Loader } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BuyCreditsModal = ({ isOpen, onClose, onCreditsPurchased }) => {
  const { token } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const creditPackages = [
    { id: 1, credits: 50, price: 500, description: 'Starter Pack' },
    { id: 2, credits: 100, price: 900, description: 'Popular Choice', popular: true },
    { id: 3, credits: 200, price: 1600, description: 'Power User' },
    { id: 4, credits: 500, price: 3500, description: 'Pro Level' },
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setLoading(true);
      const response = await axios.post(
        'https://muterianc.pythonanywhere.com/api/credits/purchase',
        { credits: selectedPackage.credits },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPurchaseSuccess(true);
        setTimeout(() => {
          onClose();
          setPurchaseSuccess(false);
          setSelectedPackage(null);
          if (onCreditsPurchased) {
            onCreditsPurchased(response.data.new_balance);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase credits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (purchaseSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">
            You've successfully purchased {selectedPackage?.credits} credits!
          </p>
          <button
            onClick={() => {
              setPurchaseSuccess(false);
              onClose();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Buy Credits</h2>
              <p className="text-gray-600">Choose a package that fits your needs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                selectedPackage?.id === pkg.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${pkg.popular ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && (
                <div className="inline-block bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
                  Most Popular
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{pkg.credits} Credits</h3>
                  <p className="text-gray-600 text-sm">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">KSh {pkg.price}</div>
                  <div className="text-sm text-gray-500">
                    KSh {(pkg.price / pkg.credits).toFixed(1)}/credit
                  </div>
                </div>
              </div>
              {selectedPackage?.id === pkg.id && (
                <div className="flex items-center space-x-1 text-blue-600 text-sm mt-2">
                  <Check className="h-4 w-4" />
                  <span>Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || loading}
            className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Coins className="h-5 w-5" />
                <span>Buy {selectedPackage?.credits || ''} Credits</span>
              </>
            )}
          </button>
        </div>

        {/* Note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            💡 Credits never expire and can be used for any skill exchange on the platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsModal;