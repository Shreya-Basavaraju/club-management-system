import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/landing.css";

function Landing() {
  const navigate = useNavigate();

  // Silently wake up the Render backend while user reads the landing page
  useEffect(() => {
    API.get("/health").catch(() => {});
  }, []);

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <div className="landing-hero">
        <div className="hero-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        
        <div className="hero-content-landing">
          <div className="hero-logo-section">
            <img src="/jit-logo.png" alt="JIT Logo" className="landing-logo" />
          </div>
          
          <h1 className="landing-title">
            <span className="title-icon">🎓</span>
            Welcome to Club Connect
          </h1>
          
          <p className="landing-subtitle">
            Jyothy Institute of Technology
          </p>
          
          <p className="landing-description">
            Your gateway to campus life! Discover clubs, join events, connect with peers, 
            and make the most of your college experience.
          </p>
          
          <div className="cta-buttons">
            <button className="btn-get-started" onClick={handleGetStarted}>
              Get Started →
            </button>
            <button className="btn-learn-more" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section-landing">
        <div className="stat-item-landing">
          <div className="stat-icon-landing">🏛️</div>
          <div className="stat-number-landing">15+</div>
          <div className="stat-label-landing">Active Clubs</div>
        </div>
        <div className="stat-item-landing">
          <div className="stat-icon-landing">📅</div>
          <div className="stat-number-landing">50+</div>
          <div className="stat-label-landing">Events Yearly</div>
        </div>
        <div className="stat-item-landing">
          <div className="stat-icon-landing">👥</div>
          <div className="stat-number-landing">500+</div>
          <div className="stat-label-landing">Active Members</div>
        </div>
        <div className="stat-item-landing">
          <div className="stat-icon-landing">🏆</div>
          <div className="stat-number-landing">100+</div>
          <div className="stat-label-landing">Certificates Issued</div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="features-section-landing">
        <h2 className="section-title">What We Offer</h2>
        <p className="section-subtitle">Everything you need to enhance your campus experience</p>
        
        <div className="features-grid-landing">
          <div className="feature-card-landing">
            <div className="feature-icon-landing">🔍</div>
            <h3>Discover Clubs</h3>
            <p>Browse through diverse clubs ranging from technical to cultural, sports to arts</p>
          </div>
          
          <div className="feature-card-landing">
            <div className="feature-icon-landing">📝</div>
            <h3>Easy Registration</h3>
            <p>Simple and quick registration process for clubs and events</p>
          </div>
          
          <div className="feature-card-landing">
            <div className="feature-icon-landing">🎫</div>
            <h3>Event Management</h3>
            <p>Stay updated with upcoming events and register with just a click</p>
          </div>
          
          <div className="feature-card-landing">
            <div className="feature-icon-landing">✅</div>
            <h3>Attendance Tracking</h3>
            <p>Automated attendance marking and tracking for all events</p>
          </div>
          
          <div className="feature-card-landing">
            <div className="feature-icon-landing">🏆</div>
            <h3>Digital Certificates</h3>
            <p>Earn and download certificates for your participation</p>
          </div>
          
          <div className="feature-card-landing">
            <div className="feature-icon-landing">📸</div>
            <h3>Event Galleries</h3>
            <p>Relive memories through event photo galleries</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Get started in three simple steps</p>
        
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">👤</div>
            <h3>Create Account</h3>
            <p>Sign up with your JIT email address</p>
          </div>
          
          <div className="step-arrow">→</div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">🔍</div>
            <h3>Explore & Join</h3>
            <p>Browse clubs and request to join</p>
          </div>
          
          <div className="step-arrow">→</div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">🎉</div>
            <h3>Participate</h3>
            <p>Attend events and earn certificates</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join hundreds of students already using Club Connect</p>
        <button className="btn-cta-large" onClick={handleGetStarted}>
          Join Now →
        </button>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/jit-logo.png" alt="JIT Logo" className="footer-logo" />
            <div>
              <h3>Club Connect</h3>
              <p>Jyothy Institute of Technology</p>
            </div>
          </div>
          <div className="footer-info">
            <p>© 2026 Club Connect. All rights reserved.</p>
            <p>Empowering campus life, one club at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
