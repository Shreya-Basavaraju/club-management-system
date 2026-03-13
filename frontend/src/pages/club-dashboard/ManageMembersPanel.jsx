function ManageMembersPanel({ clubId, members, fetchMembers }) {
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const API = (await import("../../api/api")).default;
      const token = localStorage.getItem("token");
      await API.delete(`/club-members/remove/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Member removed successfully!");
      fetchMembers();
    } catch (err) {
      console.error("Error removing member:", err);
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Manage Members</h2>

      {members.length === 0 ? (
        <div className="empty-state">
          <p>No members to manage yet.</p>
        </div>
      ) : (
        <div className="manage-members-list">
          {members.map((member) => (
            <div key={member._id} className="manage-member-item">
              <div className="member-avatar">
                {(member.name || member.student?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="member-info">
                <h4>{member.name || member.student?.name || "Unknown"}</h4>
                <p className="member-email">{member.student?.email || ""}</p>
                {(member.section || member.branch) && (
                  <p className="member-details">
                    {member.section && `Section: ${member.section}`}
                    {member.section && member.branch && " | "}
                    {member.branch && `Branch: ${member.branch}`}
                  </p>
                )}
                <p className="member-joined">
                  Joined: {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                className="btn-remove"
                onClick={() => handleRemoveMember(member._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageMembersPanel;
