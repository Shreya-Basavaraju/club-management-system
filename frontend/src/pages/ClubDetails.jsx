import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import EventCard from "../components/EventCard";
import AddEventModal from "./admin/AddEventModal";
import "../styles/dashboard.css";

function ClubDetails() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    const fetchData = async () => {
      const clubRes = await API.get(`/clubs/${id}`);
      setClub(clubRes.data);

      const eventsRes = await API.get(`/events/club/${id}`);
      setEvents(eventsRes.data);
    };

    fetchData();
  }, [id]);

  const handleDelete = async (eventId) => {
    await API.delete(`/events/${eventId}`);
    setEvents(events.filter(e => e._id !== eventId));
  };

  if (!club) return <h2 style={{ padding: "40px" }}>Loading...</h2>;

  return (
    <div className="dashboard">
      <h2>{club.name}</h2>
      <p>{club.description}</p>

      {isAdmin && (
        <button
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            background: "#c79a6b",
            border: "none",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer"
          }}
          onClick={() => setShowModal(true)}
        >
          + Add Event
        </button>
      )}

      <div className="event-grid">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p>No events yet.</p>
        )}
      </div>

      {showModal && (
        <AddEventModal
          clubId={id}
          onClose={() => setShowModal(false)}
          onEventAdded={() => window.location.reload()}
        />
      )}
    </div>
  );
}

export default ClubDetails;