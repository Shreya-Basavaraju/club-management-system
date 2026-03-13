import { useState } from "react";
import AddEventModal from "../admin/AddEventModal";
import EditEventModal from "../admin/EditEventModal";

function ManageEventsPanel({ clubId, events, setEvents }) {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const API = (await import("../../api/api")).default;
      await API.delete(`/events/${eventId}`);
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  const handleEventAdded = () => {
    window.location.reload();
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2 className="panel-title">Manage Events</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <p>No events to manage. Create your first event!</p>
        </div>
      ) : (
        <div className="manage-events-list">
          {events.map((event) => (
            <div key={event._id} className="manage-event-item">
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
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="event-description">{event.description}</p>
              </div>
              <div className="event-actions">
                <button 
                  className="btn-edit"
                  onClick={() => setEditingEvent(event)}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddEventModal
          clubId={clubId}
          onClose={() => setShowModal(false)}
          onEventAdded={handleEventAdded}
        />
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onEventUpdated={handleEventAdded}
        />
      )}
    </div>
  );
}

export default ManageEventsPanel;
