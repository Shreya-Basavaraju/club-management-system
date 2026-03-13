import { useState, useEffect } from "react";
import API from "../../api/api";

function RegistrationPanel({ clubId }) {
  const [membershipStatus, setMembershipStatus] = useState("none"); // none, pending, approved
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    branch: "",
    description: ""
  });
  const [workFiles, setWorkFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkMembershipStatus();
  }, [clubId]);

  const checkMembershipStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/club-members/status/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMembershipStatus(res.data.status);
    } catch (err) {
      console.error("Error checking membership status:", err);
      setMembershipStatus("none");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (images and videos)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert("Please upload only images (JPEG, PNG, GIF) or videos (MP4, WebM, OGG)");
      return;
    }
    
    if (files.length > 5) {
      alert("You can upload maximum 5 files");
      return;
    }
    
    setWorkFiles(files);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim() || !formData.section.trim() || !formData.branch.trim() || !formData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }
    
    if (workFiles.length === 0) {
      alert("Please upload at least one image or video of your work");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("section", formData.section.trim());
      formDataToSend.append("branch", formData.branch.trim());
      formDataToSend.append("description", formData.description.trim());
      
      // Append all work files
      workFiles.forEach(file => {
        formDataToSend.append("workFiles", file);
      });
      
      const response = await API.post(`/club-members/join/${clubId}`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      setMembershipStatus("pending");
      setShowForm(false);
      setFormData({ name: "", section: "", branch: "", description: "" });
      setWorkFiles([]);
      alert(response.data.message || "Join request submitted successfully!");
    } catch (err) {
      console.error("Error submitting join request:", err);
      const errorMessage = err.response?.data?.message || "Failed to submit join request. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm("Are you sure you want to cancel your join request?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/club-members/leave/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembershipStatus("none");
      alert("Join request cancelled");
    } catch (err) {
      console.error("Error cancelling request:", err);
      alert("Failed to cancel request");
    }
  };

  const handleLeaveClub = async () => {
    if (!window.confirm("Are you sure you want to leave this club?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/club-members/leave/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembershipStatus("none");
      alert("Successfully left the club");
    } catch (err) {
      console.error("Error leaving club:", err);
      alert("Failed to leave club");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-panel">
        <h2 className="panel-title">Club Membership</h2>
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Club Membership</h2>
      
      <div className="registration-content">
        {membershipStatus === "approved" ? (
          <div className="registration-status registered">
            <div className="status-icon">✅</div>
            <h3>You are a club member!</h3>
            <p>Your join request has been approved. You are now a registered member of this club.</p>
            <button className="btn-danger" onClick={handleLeaveClub}>
              Leave Club
            </button>
          </div>
        ) : membershipStatus === "rejected" ? (
          <div className="registration-status rejected">
            <div className="status-icon">❌</div>
            <h3>Request Rejected</h3>
            <p>Unfortunately, your join request was not approved by the admin. You can submit a new request if you'd like to try again.</p>
            <button className="btn-primary" onClick={() => {
              setFormData({ name: "", section: "", branch: "", description: "" });
              setWorkFiles([]);
              setShowForm(true);
            }}>
              Submit New Request
            </button>
          </div>
        ) : membershipStatus === "pending" ? (
          <div className="registration-status pending">
            <div className="status-icon">⏳</div>
            <h3>Request Pending</h3>
            <p>Your join request is pending admin approval. Please wait for the admin to review your application.</p>
            <button className="btn-danger" onClick={handleCancelRequest}>
              Cancel Request
            </button>
          </div>
        ) : showForm ? (
          <div className="registration-form-container">
            <h3>Request to Join Club</h3>
            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Section *</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                  placeholder="Enter your section (e.g., A, B, C)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Branch *</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  placeholder="Enter your branch (e.g., CSE, ECE, ME)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Why do you want to join this club? *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us about your interest in this club, your skills, and what you hope to contribute..."
                  rows="5"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #E5D4C1",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#5C4033",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>
              <div className="form-group">
                <label>Upload Your Work (Images/Videos) *</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  required
                />
                <small style={{color: "#7A6655", marginTop: "0.5rem", display: "block"}}>
                  Upload images or videos showcasing your work (max 5 files)
                </small>
                {workFiles.length > 0 && (
                  <div style={{marginTop: "0.5rem", color: "#5C4033"}}>
                    {workFiles.length} file(s) selected
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", section: "", branch: "", description: "" });
                    setWorkFiles([]);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="registration-status not-registered">
            <div className="status-icon">📝</div>
            <h3>Join this club</h3>
            <p>Submit a join request with your details, explain why you want to join, and showcase your work samples.</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setFormData({ name: "", section: "", branch: "", description: "" });
                setWorkFiles([]);
                setShowForm(true);
              }}
            >
              Request to Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationPanel;
