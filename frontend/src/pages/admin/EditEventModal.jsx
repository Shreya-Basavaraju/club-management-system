import { useState } from "react";
import API from "../../api/api";

function EditEventModal({ event, onClose, onEventUpdated }) {
  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
    venue: event.venue || "",
    images: []
  });
  const [preview, setPreview] = useState(
    event.images && event.images.length > 0 
      ? event.images[0].startsWith("http")
        ? event.images[0]
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${event.images[0]}`
      : null
  );

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
    if (files.length > 0) {
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("date", formData.date);
      data.append("venue", formData.venue);
      
      formData.images.forEach((img) => {
        data.append("images", img);
      });

      await API.put(`/events/${event._id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Event updated successfully!");
      onEventUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>Edit Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input
              type="text"
              placeholder="e.g., Main Auditorium, Seminar Hall"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Event Images</label>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" style={{ maxHeight: '200px', objectFit: 'contain' }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <small>Leave empty to keep current images</small>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="btn-submit">
              Update Event
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEventModal;
