import { useState } from "react";
import API from "../../api/api";
import "../../styles/admin.css";

function AddEventModal({ clubId, onClose, onEventAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [images, setImages] = useState([]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("venue", venue);

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      const token = localStorage.getItem("token");
      await API.post(`/events/${clubId}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      alert("Event added successfully");
      if (onEventAdded) {
        onEventAdded();
      }
      onClose();
    } catch (err) {
      console.error("Error adding event:", err);
      console.error("Error response:", err.response);
      alert(err.response?.data?.message || "Failed to add event");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Add Event</h2>

        <form onSubmit={submitHandler}>
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Venue (e.g., Main Auditorium, Seminar Hall)"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <input
            type="file"
            multiple
            onChange={(e) => setImages(e.target.files)}
          />

          <button type="submit">Add Event</button>
          <button type="button" className="close-btn" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;