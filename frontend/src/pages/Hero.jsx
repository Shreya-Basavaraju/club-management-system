import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/hero.css";

function Hero() {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalEvents: 0,
    myRegistrations: 0,
    myClubs: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserName(res.data.name);
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch clubs
      const clubsRes = await API.get("/clubs");
      const totalClubs = clubsRes.data.length;
      
      // Fetch all events
      let totalEvents = 0;
      for (const club of clubsRes.data) {
        const eventsRes = await API.get(`/events/club/${club._id}`);
        totalEvents += eventsRes.data.length;
      }
      
      // Fetch user-specific stats
      let myRegistrations = 0;
      let myClubs = 0;
      
      if (!isAdmin) {
        // Count registrations across all clubs
        for (const club of clubsRes.data) {
          try {
            const regRes = await API.get(`/registrations/my-registrations/${club._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            myRegistrations += regRes.data.length;
          } catch (err) {
            // Ignore errors for clubs without registrations
          }
        }
        
        // Count clubs where user is a member
        for (const club of clubsRes.data) {
          try {
            const statusRes = await API.get(`/club-members/status/${club._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (statusRes.data.status === "approved") {
              myClubs++;
            }
          } catch (err) {
            // Ignore errors
          }
        }
      }
      
      setStats({
        totalClubs,
        totalEvents,
        myRegistrations,
        myClubs
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExploreClubs = () => {
    navigate("/clubs");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="hero-container">
        <div className="loading-hero">Loading...</div>
      </div>
    );
  }

  return (
    <div className="hero-container">
      {/* Header */}
      <div className="hero-header">
        <div className="hero-brand">
          <img src="/jit-logo.png" alt="JIT Logo" className="hero-logo" />
          <div>
            <h1 className="hero-title">
              <span className="hero-icon">🎓</span>
              Club Connect
            </h1>
            <p className="hero-subtitle">Jyothy Institute of Technology</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout-hero">
          🚪 Logout
        </button>
      </div>

      {/* Hero Section */}
      <div className="hero-content">
        <div className="hero-welcome">
          <h2 className="welcome-title">
            Welcome back, <span className="user-name">{userName}</span>! 👋
          </h2>
          <p className="welcome-subtitle">
            {isAdmin 
              ? "Manage clubs, events, and members from your admin dashboard"
              : "Discover clubs, join events, and connect with your community"
            }
          </p>
          <button className="btn-explore" onClick={handleExploreClubs}>
            {isAdmin ? "Manage Clubs" : "Explore Clubs"} →
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-hero">
          <div className="stat-card-hero">
            <div className="stat-icon-hero">🏛️</div>
            <div className="stat-number-hero">{stats.totalClubs}</div>
            <div className="stat-label-hero">Total Clubs</div>
          </div>
          
          <div className="stat-card-hero">
            <div className="stat-icon-hero">📅</div>
            <div className="stat-number-hero">{stats.totalEvents}</div>
            <div className="stat-label-hero">Total Events</div>
          </div>
          
          {!isAdmin && (
            <>
              <div className="stat-card-hero highlight">
                <div className="stat-icon-hero">🎯</div>
                <div className="stat-number-hero">{stats.myRegistrations}</div>
                <div className="stat-label-hero">My Registrations</div>
              </div>
              
              <div className="stat-card-hero highlight">
                <div className="stat-icon-hero">⭐</div>
                <div className="stat-number-hero">{stats.myClubs}</div>
                <div className="stat-label-hero">My Clubs</div>
              </div>
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h3 className="features-title">
            {isAdmin ? "Admin Features" : "What You Can Do"}
          </h3>
          <div className="features-grid">
            {isAdmin ? (
              <>
                <div className="feature-card">
                  <div className="feature-icon">🏛️</div>
                  <h4>Manage Clubs</h4>
                  <p>Create, edit, and delete clubs</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📅</div>
                  <h4>Organize Events</h4>
                  <p>Schedule and manage club events</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">✅</div>
                  <h4>Track Attendance</h4>
                  <p>Mark attendance for events</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">👥</div>
                  <h4>Manage Members</h4>
                  <p>Approve and manage club members</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🏆</div>
                  <h4>Issue Certificates</h4>
                  <p>Generate certificates for attendees</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📸</div>
                  <h4>Upload Images</h4>
                  <p>Add event photos and memories</p>
                </div>
              </>
            ) : (
              <>
                <div className="feature-card">
                  <div className="feature-icon">🔍</div>
                  <h4>Discover Clubs</h4>
                  <p>Browse and explore all clubs</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📝</div>
                  <h4>Join Clubs</h4>
                  <p>Request to join your favorite clubs</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎫</div>
                  <h4>Register for Events</h4>
                  <p>Sign up for upcoming events</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">✅</div>
                  <h4>Track Attendance</h4>
                  <p>View your attendance records</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🏆</div>
                  <h4>Get Certificates</h4>
                  <p>Download your event certificates</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📸</div>
                  <h4>View Memories</h4>
                  <p>Browse event photos and galleries</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
