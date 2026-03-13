import { useNavigate } from "react-router-dom";

function DashboardSidebar({ activePanel, setActivePanel, isAdmin }) {
  const navigate = useNavigate();
  
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

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-section">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activePanel === item.id ? "active" : ""}`}
            onClick={() => setActivePanel(item.id)}
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
              onClick={() => setActivePanel(item.id)}
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
  );
}

export default DashboardSidebar;
