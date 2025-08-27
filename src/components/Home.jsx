import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Helmet } from 'react-helmet';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ Track login state

  // ✅ Trigger fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Check login based on presence of localStorage.user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.username || parsed?.email) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Invalid user JSON in localStorage", err);
      }
    }
  }, []);

  // ✅ Handle image fallback
  const handleImageError = (name) => {
    setImageErrors((prev) => ({ ...prev, [name]: true }));
  };

  // ✅ Emoji fallback icon component
  const FallbackIcon = ({ type }) => {
    const icons = {
      connect: "🤝",
      learn: "📚",
      share: "💡"
    };
    return (
      <div className="fs-1 text-primary d-flex justify-content-center align-items-center" style={{ width: '80px', height: '80px' }}>
        {icons[type]}
      </div>
    );
  };

  return (
    <div>
      <Helmet>
        <title>SkillSwap - Learn, Share, Grow</title>
        <meta name="description" content="Trade skills, learn new things, and connect with peers on SkillSwap." />
      </Helmet>

      <Navbar />

      <main>
        {/* ✅ HERO SECTION */}
        <section className="bg-light text-dark text-center py-5 position-relative overflow-hidden">
          <div className="container position-relative">
            <h1 className="display-3 fw-bold text-primary">
              Welcome to <span className="text-success">SkillSwap</span>
            </h1>
            <p className="lead fs-4 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
              Connect. Learn. Exchange skills with a global community of creators, coders, designers, and doers.
            </p>

            {/* Button logic */}
            <div className="mt-4">
              {localStorage.getItem("user") ? (
                <>
                  <Link to="/profile" className="btn btn-success btn-lg me-3 px-4 py-2">
                    🧑‍💼 Go to Profile
                  </Link>
                  <Link to="/skills" className="btn btn-outline-primary btn-lg me-3 px-4 py-2">
                    🔍 Explore Skills
                  </Link>
                  <Link to="/addskills" className="btn btn-outline-success btn-lg px-4 py-2">
                    💡 Share Your Skill
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg me-3 px-4 py-2">
                    🚀 Join Now
                  </Link>
                  <Link to="/addskills" className="btn btn-outline-success btn-lg px-4 py-2">
                    💡 Share Your Skill
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>


        {/* WHY CHOOSE SECTION */}
        <section className="container my-5 py-5">
          <div className="row text-center">
            <h2 className="display-5 fw-bold mb-4">Why Choose SkillSwap?</h2>
            <p className="text-muted mb-5">Discover the power of peer-to-peer learning</p>

            <div className="col-md-4 mb-4">
              <div className="card border-0 shadow h-100 p-4">
                <div className="card-body">
                  {imageErrors.connect ? (
                    <FallbackIcon type="connect" />
                  ) : (
                    <img
                      src="/images/connection.png"
                      width="80"
                      alt="Connect"
                      className="mb-3"
                      onError={() => handleImageError('connect')}
                    />
                  )}
                  <h4 className="text-primary">Connect with Peers</h4>
                  <p className="text-muted">Match with people who share your passion and exchange real value skills.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card border-0 shadow h-100 p-4">
                <div className="card-body">
                  {imageErrors.learn ? (
                    <FallbackIcon type="learn" />
                  ) : (
                    <img
                      src="/images/career-development.png"
                      width="80"
                      alt="Learn"
                      className="mb-3"
                      onError={() => handleImageError('learn')}
                    />
                  )}
                  <h4 className="text-success">Learn New Skills</h4>
                  <p className="text-muted">From coding to cooking — learn directly from people who do it best.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card border-0 shadow h-100 p-4">
                <div className="card-body">
                  {imageErrors.share ? (
                    <FallbackIcon type="share" />
                  ) : (
                    <img
                      src="/images/idea-exchange.png"
                      width="80"
                      alt="Share"
                      className="mb-3"
                      onError={() => handleImageError('share')}
                    />
                  )}
                  <h4 className="text-warning">Share What You Know</h4>
                  <p className="text-muted">Contribute your expertise. Build your reputation. Help others thrive.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL / CTA */}
        <section className="py-5 text-center text-white" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #198754 100%)' }}>
          <div className="container">
            <h2 className="display-4 fw-bold">“Everyone has something to teach — and something to learn.”</h2>
            <p className="lead mt-3">Join thousands of learners and teachers building skill communities.</p>

            {isLoggedIn ? (
              <Link to="/skills" className="btn btn-light btn-lg mt-4 px-5 py-2 fw-semibold">
                🔍 Explore Opportunities
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-light btn-lg mt-4 px-5 py-2 fw-semibold">
                🌟 Start Your Journey
              </Link>
            )}
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="container my-5">
          <div className="row text-center">
            <div className="col-md-3">
              <h3 className="text-primary fw-bold">10K+</h3>
              <p className="text-muted">Active Users</p>
            </div>
            <div className="col-md-3">
              <h3 className="text-success fw-bold">500+</h3>
              <p className="text-muted">Skills Listed</p>
            </div>
            <div className="col-md-3">
              <h3 className="text-warning fw-bold">50K+</h3>
              <p className="text-muted">Swaps Made</p>
            </div>
            <div className="col-md-3">
              <h3 className="text-info fw-bold">4.8★</h3>
              <p className="text-muted">Avg. Rating</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
