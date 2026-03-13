import API from "../../api/api";

function DeleteClubModal({ clubs, onClose, onDeleted }) {
  const deleteClub = async (id) => {
    await API.delete(`/clubs/${id}`);
    onDeleted();
  };

  return (
    <div className="modal">
      <h3>Delete Club</h3>

      {clubs.map(c => (
        <div key={c._id} style={{ display: "flex", gap: "10px" }}>
          <span>{c.name}</span>
          <button
            style={{ background: "red", color: "white" }}
            onClick={() => deleteClub(c._id)}
          >
            Delete
          </button>
        </div>
      ))}

      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default DeleteClubModal;