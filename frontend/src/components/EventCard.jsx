import { useNavigate } from "react-router-dom";

const EventCard = ({ event, isAdmin, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event._id}`);
  };

  return (
    <div
      className="event-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <img
        src={
          event.images && event.images.length > 0
            ? event.images[0].startsWith("http")
              ? event.images[0]
              : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${event.images[0]}`
            : "https://via.placeholder.com/300x180"
        }
        alt={event.title}
        className="event-image"
      />

      <div className="event-content">
        <h3>{event.title}</h3>

        <p className="event-date">
          {event.date
            ? new Date(event.date).toLocaleDateString()
            : "Date not available"}
        </p>

        {isAdmin && (
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();   // IMPORTANT (prevents navigation)
              onDelete(event._id);
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;