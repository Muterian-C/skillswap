import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Get authentication state from context
  const { user, token } = useAuth();
  const currentUser = user;
  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('https://muterianc.pythonanywhere.com//api/skills');
        setSkills(response.data.skills || []);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setError(error.response?.data?.message || "Failed to fetch skills. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(skills.map(skill => skill.category).filter(Boolean))];

  const LoadingSkeletons = () => (
    <div className="row">
      {[...Array(6)].map((_, index) => (
        <div className="col-md-4 mb-4" key={index}>
          <div className="card shadow-sm h-100">
            <div className="card-img-top bg-light" style={{ height: '200px' }}>
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="placeholder-glow">
                <h5 className="card-title placeholder col-6"></h5>
                <p className="card-text placeholder col-8"></p>
                <p className="card-text placeholder col-4"></p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ErrorMessage = () => (
    <div className="text-center py-5">
      <div className="alert alert-danger d-inline-block" role="alert">
        <h4 className="alert-heading">⚠️ Oops!</h4>
        <p className="mb-0">{error}</p>
        <hr />
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => window.location.reload()}
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-5">
      <div className="mb-4">
        <div className="display-1 mb-3">📚</div>
        <h3 className="text-muted mb-3">
          {searchTerm || selectedCategory !== 'all' ? 'No skills found' : 'No skills posted yet'}
        </h3>
        <p className="text-muted">
          {searchTerm || selectedCategory !== 'all'
            ? 'Try adjusting your search or filters'
            : 'Be the first to share your skills with the community!'
          }
        </p>
        {(searchTerm || selectedCategory !== 'all') && (
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            🔄 Clear Filters
          </button>
        )}
      </div>
    </div>
  );

  const SkillCard = ({ skill, index }) => {
    const isOwnSkill = currentUser && skill.user_id === currentUser.id;

    return (
      <div
        className="col-md-4 mb-4"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: `all 0.6s ease ${index * 0.1}s`
        }}
      >
        <div
          className="card shadow-sm h-100 border-0"
          style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
          }}
        >
          <div className="position-relative overflow-hidden">
            <img
              src={`https://muterianc.pythonanywhere.com/static/skills/${skill.skill_photo}`}
              className="card-img-top"
              alt={skill.skill_name}
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
                e.target.onerror = null;
              }}
              style={{
                height: '200px',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'
              }
            />

            {skill.category && (
              <span className="badge bg-primary position-absolute top-0 start-0 m-2">
                {skill.category}
              </span>
            )}
            {skill.difficulty && (
              <span className={`badge position-absolute top-0 end-0 m-2 ${skill.difficulty === 'beginner' ? 'bg-success' :
                skill.difficulty === 'intermediate' ? 'bg-warning' : 'bg-danger'
                }`}>
                {skill.difficulty}
              </span>
            )}
          </div>

          <div className="card-body d-flex flex-column">
            <h5 className="card-title text-primary fw-bold mb-2">{skill.skill_name}</h5>
            <p className="card-text text-muted flex-grow-1">
              {skill.description?.slice(0, 120)}
              {skill.description?.length > 120 ? '...' : ''}
            </p>

            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: '32px', height: '32px' }}>
                <span className="text-white fw-bold" style={{ fontSize: '14px' }}>
                  {skill.instructor_name ? skill.instructor_name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <small className="text-muted">
                by {skill.instructor_name || 'Anonymous'}
              </small>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <span className="text-warning me-1">⭐</span>
                <small className="text-muted">
                  {skill.rating || '4.5'} ({skill.reviews || Math.floor(Math.random() * 50) + 1} reviews)
                </small>
              </div>
              <small className="text-muted">
                👥 {skill.students || Math.floor(Math.random() * 100) + 1} students
              </small>
            </div>

            <div className="d-flex gap-2 mt-auto">
              <button className="btn btn-primary flex-grow-1">
                📚 Learn More
              </button>

              {!isOwnSkill && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
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
                  }}
                >
                  💬 Contact
                </button>
              )}

              {isOwnSkill && (
                <button className="btn btn-outline-success">
                  ✏️ Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="h-16"></div> {/* Spacer for fixed navbar */}

      <div className="container my-5">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold text-primary mb-3">Available Skills</h2>
          <p className="lead text-muted mb-4">Discover amazing skills from our community</p>

          {isAuthenticated && (
            <div className="mb-4">
              <a href="/addskills" className="btn btn-success">
                ➕ Add Your Skill
              </a>
            </div>
          )}

          <div className="row justify-content-center">
            <div className="col-md-6 mb-3">
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-primary text-white">
                  🔍
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <select
                className="form-select shadow-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!loading && !error && (
            <div className="text-muted">
              {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSkeletons />
        ) : error ? (
          <ErrorMessage />
        ) : filteredSkills.length > 0 ? (
          <div className="row">
            {filteredSkills.map((skill, index) => (
              <SkillCard key={skill.id || index} skill={skill} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
        <footer />
      </div>
    </div>
  );
};

export default Skills;