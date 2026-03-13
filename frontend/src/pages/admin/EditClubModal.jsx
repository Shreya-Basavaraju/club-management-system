import { useState } from "react";
import API from "../../api/api";

function EditClubModal({ club, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: club.name || "",
    description: club.description || "",
    logo: null
  });
  const [preview, setPreview] = useState(
    club.logo
      ? club.logo.startsWith("http")
        ? club.logo
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${club.logo}`
      : null
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      if (formData.logo) {
        data.append("logo", formData.logo);
      }

      await API.put(`/clubs/${club._id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Club updated successfully!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating club:", err);
      alert("Failed to update club");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Club</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Club Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
            <label>Club Logo</label>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>Leave empty to keep current logo</small>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="btn-submit">
              Update Club
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

export default EditClubModal;
