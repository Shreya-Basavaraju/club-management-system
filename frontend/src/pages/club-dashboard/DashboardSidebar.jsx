import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardSidebar({ activePanel, setActivePanel, isAdmin }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const studentMenuItems = [
    { id: "events", label: "Events", icon: "📅" },
    { id: "registration", label: "Join Club", icon: "📝" },
    { id: "certificates", label: "Certificates", icon: "🏆" },
    { id: "images", label: "Images", icon: "🖼️" },
    { id: "info", label: "Club Info", icon: "ℹ️" },
  ];

  const adminMenuItems = [
    { id: "events", label: "Events", icon: "📅" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "attendance", label: "Attendance", icon: "✅" },
    { id: "images", label: "Images", icon: "🖼️" },
    { id: "info", label: "Club Info", icon: "ℹ️" },
  ];

  const adminItems = [
    { id: "manage-events", label: "Manage Events", icon: "⚙️" },
    { id: "manage-members", label: "Manage Members", icon: "👤" },
    { id: "join-requests", label: "Join Requests", icon: "📋" },
  ];

  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  const handleNav = (id) => {
    setActivePanel(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`dashboard-sidebar${mobileOpen ? " sidebar-open" : ""}`}>
        {/* Close button inside drawer on mobile */}
        <button
          className="sidebar-close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

      <div className="sidebar-section">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activePanel === item.id ? "active" : ""}`}
            onClick={() => handleNav(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="sidebar-section admin-section">
          <div className="sidebar-divider"></div>
          <p className="sidebar-section-title">Admin</p>
          {adminItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activePanel === item.id ? "active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-section back-section">
        <div className="sidebar-divider"></div>
        <button className="sidebar-item back-btn" onClick={() => navigate('/clubs')}>
          <span className="sidebar-icon">←</span>
          <span className="sidebar-label">Back to Clubs</span>
        </button>
      </div>
    </div>
    </>
  );
}

export default DashboardSidebar;
