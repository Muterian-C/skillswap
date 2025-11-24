import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import BuyCreditsModal from './BuyCreditsModal';

const SingleSkill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCredits, setUserCredits] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const { user, token } = useAuth();
  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`https://muterianc.pythonanywhere.com/api/skill/${id}`);
        setSkill(response.data.skill);
        
        // Fetch user's credit balance if authenticated
        if (isAuthenticated) {
          await fetchUserCredits();
        }
      } catch (error) {
        console.error("Error fetching skill:", error);
        setError(error.response?.data?.error || "Failed to fetch skill details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserCredits = async () => {
      try {
        const response = await axios.get('https://muterianc.pythonanywhere.com/api/user/credits', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserCredits(response.data.credits || 0);
      } catch (error) {
        console.error("Error fetching credits:", error);
      }
    };

    fetchSkill();
  }, [id, isAuthenticated, token]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      alert("Please log in to purchase this skill.");
      navigate('/signin');
      return;
    }

    if (isOwnSkill) {
      alert("You cannot purchase your own skill.");
      return;
    }

    // Check if skill has price set
    if (!skill.price || skill.price <= 0) {
      alert("This skill is not available for purchase yet. Please contact the instructor.");
      return;
    }

    // Check credit balance
    if (userCredits < skill.price) {
      alert(`Insufficient credits. You need ${skill.price} credits but only have ${userCredits}.`);
      setIsBuyCreditsModalOpen(true);
      return;
    }

    // Confirm purchase
    const confirmPurchase = window.confirm(
      `Purchase "${skill.skill_name}" for ${skill.price} credits?\n\nYou will have ${(userCredits - skill.price).toFixed(2)} credits remaining.`
    );

    if (!confirmPurchase) return;

    setPurchasing(true);
    try {
      const response = await axios.post(
        'https://muterianc.pythonanywhere.com/api/skill/purchase',
        {
          skill_id: skill.id,
          instructor_id: skill.user_id,
          price: skill.price
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert(`Purchase successful! You can now contact ${skill.instructor_name} to schedule your session.`);
        setUserCredits(userCredits - skill.price);
        
        // Auto-navigate to messages with instructor
        navigate(`/messages/${skill.user_id}`);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error.response?.data?.error || "Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

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

  const handleBuyCredits = () => {
    setIsBuyCreditsModalOpen(true);
  };

  const handleCreditsPurchased = (newBalance) => {
    setUserCredits(newBalance);
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
                {/* PRICE BADGE */}
                {skill.price > 0 ? (
                  <span className="badge bg-success fs-6 me-2">
                    {skill.price} Credits
                  </span>
                ) : (
                  <span className="badge bg-secondary fs-6 me-2">
                    Free
                  </span>
                )}
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

            {/* CREDIT BALANCE DISPLAY */}
            {isAuthenticated && !isOwnSkill && skill.price > 0 && (
              <div className="alert alert-info py-2 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <small>
                    <strong>Your Credits:</strong> {userCredits.toFixed(2)} 
                    {userCredits < skill.price && (
                      <span className="text-danger ms-2">
                        (Need {(skill.price - userCredits).toFixed(2)} more)
                      </span>
                    )}
                  </small>
                  {userCredits < skill.price && (
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleBuyCredits}
                    >
                      Buy More Credits
                    </button>
                  )}
                </div>
              </div>
            )}

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

              <div className="d-flex align-items-center mb-3">
                <span className="text-warning me-2">⭐</span>
                <span className="me-3">
                  <strong>{skill.rating || '4.5'}</strong> ({skill.reviews || Math.floor(Math.random() * 50) + 1} reviews)
                </span>

                <span className="me-2">👥</span>
                <span>{skill.students || Math.floor(Math.random() * 100) + 1} students</span>
              </div>

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

            {/* UPDATED ACTION BUTTONS */}
            <div className="d-flex gap-2 flex-wrap">
              {!isOwnSkill && skill.price > 0 && (
                <button 
                  className="btn btn-success" 
                  onClick={handlePurchase}
                  disabled={purchasing || userCredits < skill.price}
                >
                  {purchasing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    `🛒 Purchase (${skill.price} Credits)`
                  )}
                </button>
              )}

              {!isOwnSkill && (
                <button className="btn btn-primary" onClick={handleContact}>
                  💬 Contact Instructor
                </button>
              )}

              {isOwnSkill && (
                <button className="btn btn-warning" onClick={handleEdit}>
                  ✏️ Edit Skill & Pricing
                </button>
              )}

              <button className="btn btn-outline-secondary">
                📋 Share
              </button>
            </div>

            {/* PURCHASE INFO */}
            {!isOwnSkill && skill.price > 0 && (
              <div className="mt-3 p-3 bg-light rounded">
                <h6>💰 How it works:</h6>
                <ul className="small mb-0">
                  <li>Purchase gives you access to contact the instructor</li>
                  <li>Schedule sessions directly with the instructor</li>
                  <li>Instructor receives {skill.price} credits upon completion</li>
                  <li>Credits can be used to learn other skills or withdrawn as cash</li>
                </ul>
              </div>
            )}

            {/* FREE SKILL INFO */}
            {!isOwnSkill && (!skill.price || skill.price === 0) && (
              <div className="mt-3 p-3 bg-light rounded">
                <h6>🎁 Free Skill</h6>
                <p className="small mb-0">
                  This skill is offered for free! Contact the instructor to arrange learning sessions 
                  without any credit cost.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional sections */}
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
                      Contact {skill.instructor_name || 'the instructor'} to arrange skill sessions
                      and discuss learning objectives.
                    </p>
                    {skill.price > 0 && (
                      <div className="mt-3 p-3 bg-success bg-opacity-10 rounded">
                        <h6 className="text-success">💎 Premium Skill</h6>
                        <p className="small mb-0 text-success">
                          This skill requires {skill.price} credits for access. 
                          The instructor has set this price based on their expertise and experience.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Learn Section */}
        <div className="row mt-4">
          <div className="col-12">
            <h3 className="mb-4">What You'll Learn</h3>
            <div className="card">
              <div className="card-body">
                <p className="text-muted">
                  Detailed curriculum information would go here. This could include modules, lessons,
                  and learning objectives for this skill.
                </p>
                {skill.price > 0 && (
                  <div className="alert alert-success mt-3">
                    <strong>Premium Access:</strong> By purchasing this skill, you get direct access 
                    to the instructor for personalized learning sessions and support.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Credits Modal */}
      <BuyCreditsModal 
        isOpen={isBuyCreditsModalOpen}
        onClose={() => setIsBuyCreditsModalOpen(false)}
        onCreditsPurchased={handleCreditsPurchased}
      />
    </div>
  );
};

export default SingleSkill;