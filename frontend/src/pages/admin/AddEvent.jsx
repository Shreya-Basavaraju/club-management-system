import { useState } from "react";
import API from "../../api/api";
import "../../styles/admin.css";

const AddEvent = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [clubId, setClubId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/events/add", {
        title,
        date,
        clubId,
      });

      alert("Event added");
    } catch (err) {
      alert("Error adding event");
    }
  };

  return (
    <div className="admin-form">
      <h2>Add Event</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          placeholder="Club ID"
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
        />

        <button>Add Event</button>
      </form>
    </div>
  );
};

export default AddEvent;