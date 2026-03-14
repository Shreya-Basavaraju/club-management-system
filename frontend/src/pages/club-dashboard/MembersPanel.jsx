function MembersPanel({ members, isAdmin }) {
  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Club Members</h2>
      
      {!isAdmin ? (
        <div className="info-message">
          <p>Members list is visible to club admins only.</p>
        </div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <p>No members have joined yet.</p>
        </div>
      ) : (
        <>
          <div className="members-summary">
            <p className="total-members">Total Members: <strong>{members.length}</strong></p>
          </div>
          <div className="registrations-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Branch</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member._id}>
                    <td data-label="Name">{member.name || member.student?.name || "Unknown"}</td>
                    <td data-label="Section">{member.section || "N/A"}</td>
                    <td data-label="Branch">{member.branch || "N/A"}</td>
                    <td data-label="Email">{member.student?.email || ""}</td>
                    <td data-label="Joined">
                      {new Date(member.joinedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MembersPanel;
