import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import ClubCard from "../components/ClubCard";
import AddClubModal from "./admin/AddClubModal";
import EditClubModal from "./admin/EditClubModal";
import "../styles/clubs.css";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClub, setShowAddClub] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("role") === "admin";

  const fetchUserInfo = async () => {
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

  const fetchClubs = async () => {
    setLoading(true);
    const res = await API.get("/clubs");
    setClubs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserInfo();
    fetchClubs();
  }, []);

  const deleteClub = async (id) => {
    if (!window.confirm("Delete this club?")) return;
    await API.delete(`/clubs/${id}`);
    fetchClubs();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleEditClick = (club, e) => {
    e.stopPropagation();
    setEditingClub(club);
  };

  return (
    <div className="clubs-page">
      {/* HEADER */}
      <div className="clubs-header">
        <div className="header-content">
          <div className="main-brand">
            <div className="jit-logo-container">
              <img 
                src="/jit-logo.png" 
                alt="JIT Logo" 
                className="jit-logo-image"
              />
            </div>
            <div className="brand-info">
              <h1 className="brand-title">
                <span className="brand-icon">🎓</span>
                Club Connect
              </h1>
              <p className="brand-subtitle">Jyothy Institute of Technology - Discover and join amazing clubs</p>
            </div>
          </div>

          <div className="header-actions">
            {isAdmin && (
              <div className="admin-actions">
                <button
                  onClick={() => setShowAddClub(true)}
                  className="btn-add-club"
                >
                  + Add Club
                </button>

                <button
                  onClick={() => setShowEdit(!showEdit)}
                  className="btn-edit-mode"
                >
                  {showEdit ? "Cancel Edit" : "Edit Clubs"}
                </button>

                <button
                  onClick={() => setShowDelete(!showDelete)}
                  className="btn-delete-mode"
                >
                  {showDelete ? "Cancel" : "Delete Club"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WELCOME MESSAGE */}
        {userName && (
          <div className="welcome-container">
            <span className="welcome-message">
              Welcome, <strong>{userName}</strong>!
            </span>
            <span className="user-role">({isAdmin ? "Admin" : "Student"})</span>
          </div>
        )}
      </div>

      {/* CLUB GRID */}
      <div className="clubs-grid">
        {loading ? (
          <div className="empty-clubs">
            <p>Loading clubs...</p>
          </div>
        ) : clubs.length === 0 ? (
          <div className="empty-clubs">
            <p>No clubs available yet. {isAdmin && "Add your first club!"}</p>
          </div>
        ) : (
          clubs.map((club) => (
            <div key={club._id} className="club-card-wrapper">
              <ClubCard club={club} />

              {showDelete && isAdmin && (
                <button
                  onClick={() => deleteClub(club._id)}
                  className="delete-overlay-btn"
                >
                  🗑️ Delete
                </button>
              )}

              {showEdit && isAdmin && (
                <button
                  onClick={(e) => handleEditClick(club, e)}
                  className="edit-overlay-btn"
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD CLUB MODAL */}
      {showAddClub && (
        <AddClubModal
          onClose={() => setShowAddClub(false)}
          onAdded={fetchClubs}
        />
      )}

      {/* EDIT CLUB MODAL */}
      {editingClub && (
        <EditClubModal
          club={editingClub}
          onClose={() => setEditingClub(null)}
          onUpdated={fetchClubs}
        />
      )}

      {/* Fixed Logout Button */}
      <button onClick={handleLogout} className="btn-logout-fixed">
        🚪 Logout
      </button>
    </div>
  );
}

export default Clubs;