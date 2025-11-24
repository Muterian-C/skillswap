import React, { useState } from 'react';
import { X, Coins, Check, Loader, Smartphone } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BuyCreditsModal = ({ isOpen, onClose, onCreditsPurchased }) => {
  const { token, user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('select-package');

  const creditPackages = [
    { id: 1, credits: 50, price: 500, description: 'Starter Pack' },
    { id: 2, credits: 100, price: 900, description: 'Popular Choice', popular: true },
    { id: 3, credits: 200, price: 1600, description: 'Power User' },
    { id: 4, credits: 500, price: 3500, description: 'Pro Level' },
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setError(null);
    setStep('enter-phone');
  };

  const handlePayment = async () => {
    if (!selectedPackage || !phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate and format phone number
      let formattedPhone = phoneNumber.trim();
      
      // Remove any spaces, dashes, or plus signs
      formattedPhone = formattedPhone.replace(/[\s\-+]/g, '');

      // Add country code if starting with 0
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      console.log('📞 Formatted phone:', formattedPhone);
      console.log('📦 Package:', selectedPackage);

      // Validate phone number format
      if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
        setError(`Invalid phone number format. Got: ${formattedPhone} (length: ${formattedPhone.length})`);
        setLoading(false);
        return;
      }

      // Prepare payload - IMPORTANT: send credits as INTEGER
      const payload = {
        phone: formattedPhone,
        credits: parseInt(selectedPackage.credits, 10) // Ensure it's an integer
      };

      console.log('🚀 Sending payload:', payload);
      console.log('🔐 Token exists:', !!token);

      // Call M-Pesa STK Push endpoint
      const response = await axios.post(
        'https://muterianc.pythonanywhere.com/api/mpesa/stkpush',
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ STK Push Response:', response.data);

      if (response.data.success) {
        const checkoutRequestId = response.data.checkout_request_id;
        console.log('🔖 CheckoutRequestID:', checkoutRequestId);
        
        // Wait a bit before starting to poll
        setTimeout(() => {
          pollPaymentStatus(checkoutRequestId);
        }, 2000);
      } else {
        setError(response.data.details || response.data.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.error || 
                          error.message ||
                          'Failed to initiate payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId) => {
    try {
      let attempts = 0;
      const maxAttempts = 30; // 90 seconds (30 * 3 seconds)
      
      const checkStatus = async () => {
        attempts++;
        console.log(`🔄 Polling status (attempt ${attempts}/${maxAttempts})`);

        try {
          const response = await axios.get(
            `https://muterianc.pythonanywhere.com/api/mpesa/status/${checkoutRequestId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('📊 Status response:', response.data);

          if (response.data.success || response.data.status === 'completed') {
            console.log('✅ Payment completed!');
            setPurchaseSuccess(true);

            // Refresh credits after a short delay
            setTimeout(async () => {
              try {
                const creditsResponse = await axios.get(
                  'https://muterianc.pythonanywhere.com/api/user/credits',
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (onCreditsPurchased) {
                  onCreditsPurchased(creditsResponse.data.credits);
                }
              } catch (e) {
                console.warn('Could not fetch updated credits:', e);
              }

              // Close modal after 2 seconds
              setTimeout(() => {
                onClose();
                resetModal();
              }, 2000);
            }, 500);
            return;
          } 
          
          if (response.data.status === 'failed') {
            setError('Payment was cancelled or failed. Please try again.');
            return;
          }
          
          if (attempts >= maxAttempts) {
            setError('Payment timeout. Please check your M-Pesa app and try again.');
            return;
          }

          // Keep polling
          setTimeout(checkStatus, 3000);
        } catch (pollError) {
          console.error('Poll error:', pollError);
          if (attempts >= maxAttempts) {
            setError('Could not verify payment. Check your M-Pesa app.');
          } else {
            setTimeout(checkStatus, 3000);
          }
        }
      };
      
      checkStatus();
    } catch (error) {
      console.error('Status check error:', error);
      setError('Error checking payment status. Please check M-Pesa app.');
    }
  };

  const resetModal = () => {
    setSelectedPackage(null);
    setPhoneNumber('');
    setStep('select-package');
    setError(null);
    setPurchaseSuccess(false);
  };

  const handleBack = () => {
    setStep('select-package');
    setPhoneNumber('');
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
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
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

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
                onClick={handleClose}
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
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={!phoneNumber.trim() || loading}
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
