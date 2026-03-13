import { useState, useEffect } from "react";
import API from "../../api/api";

function EventDetailsModal({ event, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [event._id]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch registrations
      const regRes = await API.get(`/registrations/event/${event._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(regRes.data || []);

      // Fetch attendance
      const attRes = await API.get(`/attendance/event/${event._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(attRes.data || []);

    } catch (err) {
      console.error("Error fetching event details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.student === studentId || a.student?._id === studentId);
    return record ? (record.present ? "present" : "absent") : "absent";
  };

  const toggleAttendance = async (registration) => {
    try {
      const token = localStorage.getItem("token");
      const studentId = registration.student?._id || registration.student;
      const currentStatus = getAttendanceStatus(studentId);
      
      if (currentStatus === "present") {
        // Remove attendance (mark as absent)
        const attRecord = attendance.find(a => (a.student === studentId || a.student?._id === studentId));
        if (attRecord) {
          await API.delete(`/attendance/${attRecord._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } else {
        // Mark as present
        await API.post(`/attendance/mark-admin/${event._id}`, {
          studentId: studentId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Refresh data
      fetchEventDetails();
    } catch (err) {
      console.error("Error toggling attendance:", err);
      alert(err.response?.data?.message || "Failed to update attendance");
    }
  };

  const hasCertificate = (studentId) => {
    return getAttendanceStatus(studentId) === "present";
  };

  const presentCount = registrations.filter(reg => getAttendanceStatus(reg.student?._id || reg.student) === "present").length;
  const absentCount = registrations.length - presentCount;
  const certificatesCount = presentCount; // Certificates available for those who attended

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Loading...</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="event-details-modal-improved" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-improved">
          <h2>{event.title}</h2>
          <button className="close-btn-improved" onClick={onClose}>✕</button>
        </div>

        <div className="event-details-content-improved">
          {/* Event Info Section */}
          <div className="event-info-card">
            <div className="info-header">
              <span className="info-icon">📅</span>
              <h3>Event Information</h3>
            </div>
            <div className="info-details">
              <div className="info-row">
                <span className="label">DATE:</span>
                <span className="value">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {event.venue && (
                <div className="info-row">
                  <span className="label">VENUE:</span>
                  <span className="value">📍 {event.venue}</span>
                </div>
              )}
              <div className="info-row">
                <span className="label">DESCRIPTION:</span>
                <span className="value">{event.description || "No description"}</span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card-improved registered">
              <div className="stat-icon-large">📝</div>
              <div className="stat-info">
                <div className="stat-number-large">{registrations.length}</div>
                <div className="stat-label-large">REGISTERED</div>
              </div>
            </div>
            <div className="stat-card-improved present">
              <div className="stat-icon-large">✅</div>
              <div className="stat-info">
                <div className="stat-number-large">{presentCount}</div>
                <div className="stat-label-large">PRESENT</div>
              </div>
            </div>
            <div className="stat-card-improved absent">
              <div className="stat-icon-large">❌</div>
              <div className="stat-info">
                <div className="stat-number-large">{absentCount}</div>
                <div className="stat-label-large">ABSENT</div>
              </div>
            </div>
            <div className="stat-card-improved certificates">
              <div className="stat-icon-large">🏆</div>
              <div className="stat-info">
                <div className="stat-number-large">{certificatesCount}</div>
                <div className="stat-label-large">CERTIFICATES</div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="students-card">
            <div className="students-header">
              <span className="students-icon">👥</span>
              <h3>Registered Students</h3>
            </div>
            {registrations.length === 0 ? (
              <p className="no-students">No students registered yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="students-table-improved">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Section</th>
                      <th>Branch</th>
                      <th>Attendance</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => {
                      const status = getAttendanceStatus(reg.student?._id || reg.student);
                      const certAvailable = hasCertificate(reg.student?._id || reg.student);
                      
                      return (
                        <tr key={reg._id}>
                          <td>{reg.name}</td>
                          <td>{reg.section}</td>
                          <td>{reg.branch}</td>
                          <td>
                            <button 
                              className={`attendance-toggle-btn ${status}`}
                              onClick={() => toggleAttendance(reg)}
                            >
                              {status === "present" ? "✅ Present" : "❌ Absent"}
                            </button>
                          </td>
                          <td>
                            <span className={`badge-improved cert-${certAvailable ? "yes" : "no"}`}>
                              {certAvailable ? "🏆 Available" : "⏳ Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;
