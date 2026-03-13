import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../../api/api";
import EventDetailsModal from "./EventDetailsModal";
import AddEventModal from "../admin/AddEventModal";

function EventsPanel({ events, clubId }) {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    branch: ""
  });

  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    if (!isAdmin) {
      checkRegistrations();
    }
  }, [events, isAdmin]);

  const checkRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      const userResponse = await API.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentUserId = String(userResponse.data._id);

      const registered = new Set();
      
      for (const event of events) {
        try {
          const res = await API.get(`/registrations/event/${event._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const isRegistered = res.data.some(reg => {
            const regStudentId = String(reg.student?._id || reg.student);
            return regStudentId === currentUserId;
          });
          
          if (isRegistered) {
            registered.add(event._id);
          }
        } catch (err) {
          console.error(`Error checking registration for event ${event._id}:`, err);
        }
      }
      
      setRegisteredEvents(registered);
    } catch (err) {
      console.error("Error checking registrations:", err);
    }
  };

  const handleEventClick = (event) => {
    if (isAdmin) {
      // Admin clicks to see details
      setSelectedEvent(event);
      setShowDetailsModal(true);
    }
  };

  const handleRegisterClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowRegisterModal(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await API.post(`/registrations/register/${selectedEvent._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Successfully registered for the event!");
      setShowRegisterModal(false);
      setFormData({ name: "", section: "", branch: "" });
      
      // Update registered events
      setRegisteredEvents(prev => new Set([...prev, selectedEvent._id]));
    } catch (err) {
      console.error("Error registering:", err);
      alert(err.response?.data?.message || "Failed to register for event");
    }
  };

  const handleEventAdded = async () => {
    try {
      const res = await API.get(`/events/club/${clubId}`);
      window.location.reload();
    } catch (err) {
      console.error("Error fetching events:", err);
      window.location.reload();
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2 className="panel-title">Events</h2>
        {isAdmin && (
          <button 
            className="btn-primary"
            onClick={() => setShowAddEventModal(true)}
          >
            + Add Event
          </button>
        )}
      </div>
      
      {events.length === 0 ? (
        <div className="empty-state">
          <p>No events scheduled yet.</p>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isCompleted = eventDate < today;
            
            return (
              <div 
                key={event._id} 
                className={`event-item ${isAdmin ? 'clickable' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleEventClick(event)}
              >
                {event.images && event.images.length > 0 && (
                  <img 
                    src={
                      event.images[0].startsWith("http")
                        ? event.images[0]
                        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${event.images[0]}`
                    }
                    alt={event.title}
                    className="event-thumbnail"
                  />
                )}
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="event-date">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  {event.venue && (
                    <p className="event-venue">📍 {event.venue}</p>
                  )}
                  <p className="event-description">{event.description}</p>
                  {isCompleted && (
                    <div className="event-status-badge completed">
                      ✓ Completed
                    </div>
                  )}
                  {isAdmin && <p className="click-hint">Click to view details</p>}
                </div>
                {!isAdmin && (
                  isCompleted ? (
                    <div className="completed-badge">
                      ✓ Event Completed
                    </div>
                  ) : registeredEvents.has(event._id) ? (
                    <div className="registered-badge">
                      ✓ Already Registered
                    </div>
                  ) : (
                    <button 
                      className="btn-register-event"
                      onClick={(e) => handleRegisterClick(event, e)}
                    >
                      Register
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Register for {selectedEvent.title}</h3>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-submit">Register</button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showAddEventModal && (
        <AddEventModal
          clubId={clubId}
          onClose={() => setShowAddEventModal(false)}
          onEventAdded={handleEventAdded}
        />
      )}
    </div>
  );
}

export default EventsPanel;
