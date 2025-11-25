import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  Filter, 
  Search,
  Calendar,
  Coins,
  User,
  MessageCircle
} from 'lucide-react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const PurchaseHistory = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending, cancelled
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPurchaseHistory();
  }, [token]);

  const fetchPurchaseHistory = async () => {
    try {
      // This endpoint needs to be created in your backend
      const response = await axios.get(
        'https://muterianc.pythonanywhere.com/api/user/purchases',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPurchases(response.data.purchases || []);
      }
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesFilter = filter === 'all' || purchase.status === filter;
    const matchesSearch = purchase.skill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleContactInstructor = (instructorId) => {
    navigate(`/messages/${instructorId}`);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="h-16"></div>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading purchase history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="h-16"></div>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
            <p className="text-gray-600">Track all your skill purchases and learning sessions</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                      filter === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All Purchases' : status}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search purchases..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Purchases List */}
          {filteredPurchases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filter !== 'all' ? 'No matching purchases' : 'No purchases yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start learning by purchasing your first skill!'}
                </p>
                {!searchTerm && filter === 'all' && (
                  <button
                    onClick={() => navigate('/skills')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Browse Skills
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Purchase Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {purchase.skill_photo && (
                          <img
                            src={`https://muterianc.pythonanywhere.com/static/skills/${purchase.skill_photo}`}
                            alt={purchase.skill_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {purchase.skill_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>Instructor: {purchase.instructor_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4" />
                              <span>{purchase.price_paid} Credits</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(purchase.purchased_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(purchase.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                              {purchase.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContactInstructor(purchase.instructor_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact
                      </button>
                      {purchase.status === 'completed' && (
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {purchases.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{purchases.length}</div>
                <div className="text-sm text-gray-600">Total Purchases</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-green-600">
                  {purchases.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {purchases.filter(p => p.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {purchases.reduce((total, p) => total + (p.price_paid || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Credits Spent</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
