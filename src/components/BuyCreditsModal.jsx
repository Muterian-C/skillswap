import React, { useState } from 'react';
import { X, Coins, Check, Loader, Smartphone } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BuyCreditsModal = ({ isOpen, onClose, onCreditsPurchased }) => {
  const { token, user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('select-package'); // 'select-package' or 'enter-phone'

  const creditPackages = [
    { id: 1, credits: 50, price: 500, description: 'Starter Pack' },
    { id: 2, credits: 100, price: 900, description: 'Popular Choice', popular: true },
    { id: 3, credits: 200, price: 1600, description: 'Power User' },
    { id: 4, credits: 500, price: 3500, description: 'Pro Level' },
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setStep('enter-phone');
  };

  const handlePayment = async () => {
    if (!selectedPackage || !phoneNumber) return;

    try {
      setLoading(true);

      // Validate phone number
      const formattedPhone = phoneNumber.startsWith('0') ? '254' + phoneNumber.slice(1) : phoneNumber;
      
      if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
        alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
        setLoading(false);
        return;
      }

      // Call M-Pesa STK Push endpoint
      const response = await axios.post(
        'https://muterianc.pythonanywhere.com/api/mpesa/stkpush',
        { 
          phone: phoneNumber,
          credits: selectedPackage.credits 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Start polling for payment status
        const checkoutRequestId = response.data.checkout_request_id;
        await pollPaymentStatus(checkoutRequestId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId) => {
    try {
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkStatus = async () => {
        attempts++;
        const response = await axios.get(
          `https://muterianc.pythonanywhere.com/api/mpesa/status/${checkoutRequestId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.status === 'completed') {
          setPurchaseSuccess(true);
          // Refresh credits
          const creditsResponse = await axios.get(
            'https://muterianc.pythonanywhere.com/api/user/credits',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setTimeout(() => {
            onClose();
            setPurchaseSuccess(false);
            setSelectedPackage(null);
            setPhoneNumber('');
            setStep('select-package');
            if (onCreditsPurchased) {
              onCreditsPurchased(creditsResponse.data.credits);
            }
          }, 3000);
          return true;
        } else if (response.data.status === 'failed') {
          alert('Payment failed. Please try again.');
          return true;
        } else if (attempts >= maxAttempts) {
          alert('Payment timeout. Please check your M-Pesa messages.');
          return true;
        } else {
          setTimeout(checkStatus, 3000);
          return false;
        }
      };
      
      await checkStatus();
    } catch (error) {
      console.error('Status check error:', error);
      alert('Error checking payment status.');
    }
  };

  const handleBack = () => {
    setStep('select-package');
    setPhoneNumber('');
  };

  if (!isOpen) return null;

  if (purchaseSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            You've successfully purchased {selectedPackage?.credits} credits!
          </p>
          <p className="text-sm text-gray-500">
            Credits have been added to your account.
          </p>
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
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 'select-package' ? 'Buy Credits' : 'Enter Phone Number'}
              </h2>
              <p className="text-gray-600">
                {step === 'select-package' 
                  ? 'Choose a package that fits your needs' 
                  : 'Enter your M-Pesa phone number'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {step === 'select-package' ? (
          <>
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
                  onClick={() => handlePackageSelect(pkg)}
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
                onClick={() => selectedPackage && handlePackageSelect(selectedPackage)}
                disabled={!selectedPackage}
                className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue to Payment</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Phone Number Input */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-blue-800">M-Pesa Payment</p>
                  <p className="text-xs text-blue-600">
                    You will receive an STK push on your phone to complete payment
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{selectedPackage?.credits} Credits</span>
                    <span>KSh {selectedPackage?.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={!phoneNumber || loading}
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Pay KSh {selectedPackage?.price}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

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