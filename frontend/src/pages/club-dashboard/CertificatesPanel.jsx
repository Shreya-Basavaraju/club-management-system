import { useState, useEffect } from "react";
import API from "../../api/api";

function CertificatesPanel({ clubId }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, [clubId]);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token");
      // Get all registrations for this club
      const res = await API.get(`/registrations/my-registrations/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Include all registrations (both with and without attendance)
      setCertificates(res.data || []);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (eventId, eventTitle) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL || "https://club-management-system-d0pp.onrender.com";
      const response = await fetch(`${baseURL}/api/certificates/generate/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate certificate");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventTitle}_certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading certificate:", err);
      alert("Failed to download certificate");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-panel">
        <h2 className="panel-title">Certificates</h2>
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">My Certificates</h2>
      
      {certificates.length === 0 ? (
        <div className="empty-state">
          <p>No events registered yet. Register for events to see your attendance status and download certificates.</p>
        </div>
      ) : (
        <div className="certificates-grid">
          {certificates.map((cert) => {
            const isPresent = cert.attendanceMarked;
            
            return (
              <div key={cert._id} className={`certificate-card ${isPresent ? 'present' : 'absent'}`}>
                <div className="certificate-icon">
                  {isPresent ? '🏆' : '⏳'}
                </div>
                <div className="certificate-content">
                  <h3>{cert.event?.title || "Event Certificate"}</h3>
                  <p className="certificate-date">
                    Event Date: {new Date(cert.event?.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {cert.event?.venue && (
                    <p className="certificate-venue">📍 {cert.event.venue}</p>
                  )}
                  <div className="certificate-info">
                    <p><strong>Name:</strong> {cert.name}</p>
                    <p><strong>Section:</strong> {cert.section}</p>
                    <p><strong>Branch:</strong> {cert.branch}</p>
                  </div>
                  <div className="attendance-status-info">
                    {isPresent ? (
                      <div className="status-present">
                        <span className="status-icon">✅</span>
                        <span className="status-text">Present - Certificate Available</span>
                      </div>
                    ) : (
                      <div className="status-absent">
                        <span className="status-icon">❌</span>
                        <span className="status-text">Absent - Certificate Not Available</span>
                      </div>
                    )}
                  </div>
                </div>
                {isPresent ? (
                  <button 
                    className="btn-download"
                    onClick={() => handleDownload(cert.event._id, cert.event?.title || "certificate")}
                  >
                    📥 Download Certificate
                  </button>
                ) : (
                  <button 
                    className="btn-download disabled"
                    disabled
                  >
                    🔒 Not Available
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CertificatesPanel;
