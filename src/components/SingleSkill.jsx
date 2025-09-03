import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const SingleSkill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const currentUser = user;
  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        setLoading(true);
        setError(null);
        // CORRECTED URL: /api/skill/${id} (singular) instead of /api/skills/${id} (plural)
        const response = await axios.get(`https://muterianc.pythonanywhere.com/api/skill/${id}`);
        setSkill(response.data.skill || response.data);
      } catch (error) {
        console.error("Error fetching skill:", error);
        setError(error.response?.data?.message || "Failed to fetch skill details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [id]);

  const handleContact = () => {
    if (!isAuthenticated) {
      alert("Please log in to contact this user.");
      return;
    }

    if (!skill.user_id) {
      console.error("Cannot contact: user_id is undefined", skill);
      alert("Sorry, cannot contact this user at the moment.");
      return;
    }

    navigate(`/messages/${skill.user_id}`);
  };

  const handleEdit = () => {
    navigate(`/edit-skill/${skill.id}`);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="h-16"></div>
        <div className="container my-5">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="h-16"></div>
        <div className="container my-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div>
        <Navbar />
        <div className="h-16"></div>
        <div className="container my-5">
          <div className="alert alert-warning" role="alert">
            Skill not found
          </div>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnSkill = currentUser && skill.user_id === currentUser.id;

  return (
    <div>
      <Navbar />
      <div className="h-16"></div>

      <div className="container my-5">
        <button 
          className="btn btn-outline-secondary mb-4"
          onClick={() => navigate(-1)}
        >
          ← Back to Skills
        </button>

        <div className="row">
          <div className="col-md-6 mb-4">
            <img
              src={`https://muterianc.pythonanywhere.com/static/skills/${skill.skill_photo}`}
              className="img-fluid rounded shadow"
              alt={skill.skill_name}
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
                e.target.onerror = null;
              }}
            />
          </div>
          
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h1 className="display-5 fw-bold text-primary">{skill.skill_name}</h1>
              
              <div>
                {skill.category && (
                  <span className="badge bg-primary me-2">
                    {skill.category}
                  </span>
                )}
                {skill.difficulty && (
                  <span className={`badge ${skill.difficulty === 'beginner' ? 'bg-success' :
                    skill.difficulty === 'intermediate' ? 'bg-warning' : 'bg-danger'
                    }`}>
                    {skill.difficulty}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: '40px', height: '40px' }}>
                  <span className="text-white fw-bold">
                    {skill.instructor_name ? skill.instructor_name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <p className="mb-0 fw-bold">Instructor</p>
                  <p className="mb-0">{skill.instructor_name || 'Anonymous'}</p>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3">
                <span className="text-warning me-2">⭐</span>
                <span className="me-3">
                  <strong>{skill.rating || '4.5'}</strong> ({skill.reviews || Math.floor(Math.random() * 50) + 1} reviews)
                </span>
                
                <span className="me-2">👥</span>
                <span>{skill.students || Math.floor(Math.random() * 100) + 1} students</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="mb-3">Description</h4>
              <p className="lead">{skill.description || 'No description available.'}</p>
            </div>

            <div className="d-flex gap-2">
              {!isOwnSkill && (
                <button className="btn btn-primary" onClick={handleContact}>
                  💬 Contact Instructor
                </button>
              )}
              
              {isOwnSkill && (
                <button className="btn btn-success" onClick={handleEdit}>
                  ✏️ Edit Skill
                </button>
              )}
              
              <button className="btn btn-outline-secondary">
                📋 Share
              </button>
            </div>
          </div>
        </div>

        {/* Additional sections can be added here */}
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="mb-4">What You'll Learn</h3>
            <div className="card">
              <div className="card-body">
                <p className="text-muted">
                  Detailed curriculum information would go here. This could include modules, lessons, 
                  and learning objectives for this skill.
                </p>
                {/* You can expand this section with actual curriculum data when available */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleSkill;