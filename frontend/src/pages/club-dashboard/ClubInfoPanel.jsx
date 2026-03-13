function ClubInfoPanel({ club, eventsCount, membersCount }) {
  if (!club) return null;

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Club Information</h2>
      
      <div className="club-info-content">
        {club.logo && (
          <div className="club-logo-container">
            <img 
              src={
                club.logo.startsWith("http")
                  ? club.logo
                  : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${club.logo.startsWith('uploads/') ? club.logo : 'uploads/' + club.logo}`
              }
              alt={club.name}
              className="club-logo-large"
            />
          </div>
        )}

        <div className="info-section">
          <h3 className="info-label">Club Name</h3>
          <p className="info-value">{club.name}</p>
        </div>

        <div className="info-section">
          <h3 className="info-label">Description</h3>
          <p className="info-value">{club.description || "No description available."}</p>
        </div>

        {club.adminName && (
          <div className="info-section">
            <h3 className="info-label">Admin</h3>
            <p className="info-value">{club.adminName}</p>
          </div>
        )}

        <div className="info-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <p className="stat-value">{eventsCount}</p>
              <p className="stat-label">Total Events</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p className="stat-value">{membersCount || 0}</p>
              <p className="stat-label">Total Members</p>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3 className="info-label">Created</h3>
          <p className="info-value">
            {new Date(club.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClubInfoPanel;
