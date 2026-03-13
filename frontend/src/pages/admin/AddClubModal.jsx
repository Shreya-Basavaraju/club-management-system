import { useState } from "react";
import API from "../../api/api";

const AddClubModal = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logo) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("logo", logo);

    await API.post("/clubs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    onAdded();   // refresh clubs
    onClose();   // close modal
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "8px",
          width: "320px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h3>Add Club</h3>

        <input
          type="text"
          placeholder="Club Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files[0])}
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit">Add Club</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClubModal;