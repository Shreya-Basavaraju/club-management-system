import { useState } from "react";
import API from "../../api/api";
import "../../styles/admin.css";

function AddClub() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", logo);

    try {
      await API.post("/clubs/add", formData);
      alert("Club added successfully");
    } catch (err) {
      alert("Error adding club");
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>Add Club</h2>

      <input
        placeholder="Club Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setLogo(e.target.files[0])}
      />

      <button>Add Club</button>
    </form>
  );
}

export default AddClub;