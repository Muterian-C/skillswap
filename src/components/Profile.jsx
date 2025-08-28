import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Star, Edit, Trash2, LogOut, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; // ⬅️ use AuthContext
import Navbar from './Navbar';

const Profile = () => {
  const { user, token, logout } = useAuth(); // ⬅️ grab user & token from context
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch fresh user data from backend
        const userResponse = await axios.get('https://muterianc.pythonanywhere.com//api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch user skills
        const skillsResponse = await axios.get(
          `https://muterianc.pythonanywhere.com//api/user_skills/${userResponse.data.user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserSkills(skillsResponse.data.skills || []);
      } catch (err) {
        console.error("Auth error:", err);
        setError('Session expired. Please login again.');
        logout(); // ⬅️ use AuthContext logout
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate, logout]);

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/delete_skill/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserSkills(prev => prev.filter(skill => skill.id !== skillId));
      setSuccess('Skill deleted successfully');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete skill');
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Navbar />
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  {user.phone && <p className="text-gray-500 mt-1">{user.phone}</p>}
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Skills Section */}

        {/* Skills Section */}
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your Skills</h2>
                    <Link
                      to="/addskills"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Skill
                    </Link>
                  </div>
        
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiAlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
        
                  {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiAlertCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}
        
                  {userSkills.length === 0 ? (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                          <Star className="h-full w-full" />
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No skills yet</h3>
                        <p className="mt-1 text-gray-500">Get started by adding your first skill.</p>
                        <div className="mt-6">
                          <Link
                            to="/addskills"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Skill
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {userSkills.map((skill) => (
                        <div key={skill.id} className="bg-white shadow rounded-lg overflow-hidden">
                          {skill.skill_photo ? (
                            <img
                              className="h-48 w-full object-cover"
                              src={`http://localhost:5000/${skill.skill_photo}`}
                              alt={skill.skill_name}
                            />
                          ) : (
                            <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{skill.skill_name}</h3>
                                <p className="mt-1 text-sm text-gray-500">{skill.category}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-500">
                                  {skill.years_experience} {skill.years_experience === 1 ? 'year' : 'years'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <Star
                                    key={rating}
                                    className={`h-5 w-5 ${skill.proficiency >= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-500">
                                {skill.proficiency}/5
                              </span>
                            </div>
                            <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                              {skill.description || 'No description provided.'}
                            </p>
                            <div className="mt-6 flex justify-between">
                              <button
                                onClick={() => navigate(`/edit-skill/${skill.id}`)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

        
        {/* ... keep the rest of your Skills UI the same ... */}
      </div>
    </div>
  );
};

export default Profile;
