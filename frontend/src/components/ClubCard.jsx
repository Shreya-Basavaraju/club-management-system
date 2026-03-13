import { useNavigate } from "react-router-dom";

const ClubCard = ({ club, showDelete, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div
      className="club-card"
      onClick={() => navigate(`/clubs/${club._id}`)}
    >
      {/* 🔥 NAME AT TOP */}
      <h3 className="club-title">{club.name}</h3>

      {/* IMAGE */}
      <img
  src={
    club.logo
      ? club.logo.startsWith("http")
        ? club.logo
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${club.logo.startsWith("uploads/") ? club.logo : `uploads/${club.logo}`}`
      : "https://via.placeholder.com/300x180"
  }
  alt={club.name}
  className="club-image"
/>

      {/* DESCRIPTION */}
      <p>{club.description}</p>

      {showDelete && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(club._id);
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default ClubCard;