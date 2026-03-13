import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/dashboard.css";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    API.get(`/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!event) return <h2 style={{ padding: "40px" }}>Loading...</h2>;

  return (
    <div className="dashboard">
      <h2>{event.title}</h2>

      <p className="event-date">
        {new Date(event.date).toLocaleDateString()}
      </p>

      {event.images?.length > 0 && (
        <img
          src={
            event.images[0].startsWith("http")
              ? event.images[0]
              : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${event.images[0]}`
          }
          className="event-detail-image"
          alt="event"
        />
      )}

      <p>{event.description}</p>

      {isAdmin && (
        <>
          <h3>Registered Students</h3>
          {event.registrations?.length > 0 ? (
            event.registrations.map(r => (
              <p key={r._id}>{r.studentName}</p>
            ))
          ) : (
            <p>No registrations yet.</p>
          )}
        </>
      )}
    </div>
  );
}

export default EventDetails;