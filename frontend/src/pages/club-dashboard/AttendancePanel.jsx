import { useState, useEffect } from "react";
import API from "../../api/api";

function AttendancePanel({ clubId }) {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegisteredEvents();
  }, [clubId]);

  const fetchRegisteredEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/registrations/my-registrations/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegisteredEvents(res.data || []);
    } catch (err) {
      console.error("Error fetching registered events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`/attendance/mark/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Attendance marked successfully!");
      fetchRegisteredEvents(); // Refresh to show updated status
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-panel">
        <h2 className="panel-title">Attendance</h2>
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Mark Attendance</h2>
      
      {registeredEvents.length === 0 ? (
        <div className="empty-state">
          <p>No registered events. Register for events to mark attendance.</p>
        </div>
      ) : (
        <div className="attendance-events-list">
          {registeredEvents.map((registration) => (
            <div key={registration._id} className="attendance-event-card">
              {registration.event?.images && registration.event.images.length > 0 && (
                <img 
                  src={
                    registration.event.images[0].startsWith("http")
                      ? registration.event.images[0]
                      : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${registration.event.images[0]}`
                  }
                  alt={registration.event.title}
                  className="event-thumbnail-small"
                />
              )}
              <div className="event-details">
                <h3>{registration.event?.title || "Event"}</h3>
                <p className="event-date">
                  {new Date(registration.event?.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <div className="registration-info">
                  <span>Name: {registration.name}</span>
                  <span>Section: {registration.section}</span>
                  <span>Branch: {registration.branch}</span>
                </div>
              </div>
              <div className="attendance-action">
                {registration.attendanceMarked ? (
                  <div className="attendance-marked">
                    <span className="status-badge marked">✅ Attended</span>
                  </div>
                ) : (
                  <button 
                    className="btn-mark-attendance"
                    onClick={() => handleMarkAttendance(registration.event._id)}
                  >
                    Mark Attendance
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttendancePanel;
