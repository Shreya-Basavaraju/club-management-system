import { useState, useEffect } from "react";
import API from "../../api/api";

function JoinRequestsPanel({ clubId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchJoinRequests();
  }, [clubId]);

  const fetchJoinRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/club-members/club/${clubId}/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching join requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm("Are you sure you want to approve this join request?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.put(`/club-members/approve/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Join request approved successfully!");
      fetchJoinRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this join request?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.put(`/club-members/reject/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Join request rejected");
      fetchJoinRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request");
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request permanently?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/club-members/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Request deleted successfully");
      fetchJoinRequests();
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("Failed to delete request");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-panel">
        <h2 className="panel-title">Join Requests</h2>
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Join Requests</h2>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No join requests</p>
        </div>
      ) : (
        <div className="join-requests-list">
          {requests.map((request) => (
            <div key={request._id} className="join-request-card">
              <div className="request-header">
                <div className="student-avatar">
                  {request.name.charAt(0).toUpperCase()}
                </div>
                <div className="request-info">
                  <h3>{request.name}</h3>
                  <p className="request-details">
                    {request.section} - {request.branch}
                  </p>
                  <p className="request-email">{request.student?.email}</p>
                  <p className="request-date">
                    Requested: {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                  <div className={`status-badge status-${request.status}`}>
                    {request.status === "pending" && "⏳ Pending"}
                    {request.status === "approved" && "✓ Approved"}
                    {request.status === "rejected" && "✗ Rejected"}
                  </div>
                </div>
              </div>
              <div className="request-actions">
                <button 
                  className="btn-view-details"
                  onClick={() => handleViewDetails(request)}
                >
                  View Work
                </button>
                {request.status === "pending" && (
                  <>
                    <button 
                      className="btn-approve"
                      onClick={() => handleApprove(request._id)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleReject(request._id)}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {request.status === "rejected" && (
                  <button 
                    className="btn-approve"
                    onClick={() => handleApprove(request._id)}
                  >
                    ✓ Approve
                  </button>
                )}
                {request.status === "approved" && (
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(request._id)}
                  >
                    ✗ Reject
                  </button>
                )}
                <button 
                  className="btn-delete-request"
                  onClick={() => handleDelete(request._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content request-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join Request Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="request-details-content">
              <div className="detail-section">
                <h3>Student Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedRequest.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedRequest.student?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Section:</span>
                  <span className="detail-value">{selectedRequest.section}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Branch:</span>
                  <span className="detail-value">{selectedRequest.branch}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requested:</span>
                  <span className="detail-value">
                    {new Date(selectedRequest.requestedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Why They Want to Join</h3>
                <div className="description-box">
                  {selectedRequest.description || "No description provided"}
                </div>
              </div>

              <div className="detail-section">
                <h3>Student Work Samples</h3>
                <div className="work-files-grid">
                  {selectedRequest.workFiles && selectedRequest.workFiles.length > 0 ? (
                    selectedRequest.workFiles.map((file, index) => {
                      const isVideo = file.match(/\.(mp4|webm|ogg)$/i);
                      const fileUrl = file.startsWith("http")
                        ? file
                        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${file}`;
                      return (
                        <div key={index} className="work-file-item">
                          {isVideo ? (
                            <video 
                              src={fileUrl}
                              controls
                              className="work-video"
                            />
                          ) : (
                            <img 
                              src={fileUrl}
                              alt={`Work ${index + 1}`}
                              className="work-image"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p>No work files uploaded</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-approve-large"
                  onClick={() => handleApprove(selectedRequest._id)}
                >
                  ✓ Approve Request
                </button>
                <button 
                  className="btn-reject-large"
                  onClick={() => handleReject(selectedRequest._id)}
                >
                  ✗ Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JoinRequestsPanel;
