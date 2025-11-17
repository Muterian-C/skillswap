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
  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`https://muterianc.pythonanywhere.com/api/skill/${id}`);
        // ✅ FIXED: Always use .skill for consistency
        setSkill(response.data.skill);
      } catch (error) {
        console.error("Error fetching skill:", error);
        setError(error.response?.data?.error || "Failed to fetch skill details. Please try again.");
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

  // ✅ FIXED: Better user ID comparison
  const isOwnSkill = user?.id === skill.user_id;

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
            {skill.skill_photo ? (
              <img
                src={`https://muterianc.pythonanywhere.com/static/skills/${skill.skill_photo}`}
                className="img-fluid rounded shadow"
                alt={skill.skill_name}
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                  e.target.onerror = null;
                }}
                style={{ maxHeight: '500px', objectFit: 'cover', width: '100%' }}
              />
            ) : (
              // ✅ ADDED: Proper fallback for missing images
              <div 
                className="img-fluid rounded shadow bg-light d-flex align-items-center justify-content-center"
                style={{ height: '300px', width: '100%' }}
              >
                <span className="text-muted">No image available</span>
              </div>
            )}
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
                  <span className={`badge ${
                    skill.difficulty === 'beginner' ? 'bg-success' :
                    skill.difficulty === 'intermediate' ? 'bg-warning' : 'bg-danger'
                  }`}>
                    {skill.difficulty}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: '40px', height: '40px' }}
                >
                  <span className="text-white fw-bold">
                    {skill.instructor_name ? skill.instructor_name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <p className="mb-0 fw-bold">Instructor</p>
                  <p className="mb-0">{skill.instructor_name || 'Anonymous'}</p>
                </div>
              </div>

              {/* ✅ KEPT: Placeholder ratings and students */}
              <div className="d-flex align-items-center mb-3">
                <span className="text-warning me-2">⭐</span>
                <span className="me-3">
                  <strong>{skill.rating || '4.5'}</strong> ({skill.reviews || Math.floor(Math.random() * 50) + 1} reviews)
                </span>
                
                <span className="me-2">👥</span>
                <span>{skill.students || Math.floor(Math.random() * 100) + 1} students</span>
              </div>

              {/* ✅ ADDED: Actual skill data from backend */}
              {(skill.proficiency || skill.years_experience) && (
                <div className="d-flex align-items-center gap-4 text-muted">
                  {skill.proficiency && (
                    <small>Proficiency: {skill.proficiency}/5</small>
                  )}
                  {skill.years_experience && (
                    <small>Experience: {skill.years_experience} year{skill.years_experience !== 1 ? 's' : ''}</small>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h4 className="mb-3">Description</h4>
              <p className="lead">{skill.description || 'No description available.'}</p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
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
            <h3 className="mb-4">Skill Details</h3>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h5>About this Skill</h5>
                    <p className="text-muted">
                      {skill.description || 'No additional details available.'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h5>Instructor Information</h5>
                    <p className="text-muted">
                      Contact {skill.instructor_name || 'the instructor'} to arrange skill exchange sessions 
                      and discuss learning objectives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleSkill;