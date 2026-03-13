import { useState, useEffect } from "react";
import API from "../../api/api";

function AttendanceManagementPanel({ clubId }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const fetchEvents = async () => {
    try {
      const res = await API.get(`/events/club/${clubId}`);
      setEvents(res.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const token = localStorage.getItem("token");

      // Fetch registrations
      const regRes = await API.get(`/registrations/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(regRes.data || []);

      // Fetch attendance
      const attRes = await API.get(`/attendance/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(attRes.data || []);

    } catch (err) {
      console.error("Error fetching event details:", err);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchEventDetails(event._id);
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.student === studentId || a.student?._id === studentId);
    return record ? (record.present ? "present" : "absent") : "absent";
  };

  const markPresent = async (registration) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const studentId = registration.student?._id || registration.student;
      
      console.log("=== MARK PRESENT DEBUG ===");
      console.log("Event ID:", selectedEvent._id);
      console.log("Student ID:", studentId);
      console.log("API URL:", `/attendance/mark-admin/${selectedEvent._id}`);
      console.log("Full URL:", `http://localhost:5000/api/attendance/mark-admin/${selectedEvent._id}`);
      
      const response = await API.post(`/attendance/mark-admin/${selectedEvent._id}`, {
        studentId: studentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Success response:", response.data);
      
      // Refresh data
      await fetchEventDetails(selectedEvent._id);
      alert("Attendance marked successfully!");
    } catch (err) {
      console.error("=== ERROR DETAILS ===");
      console.error("Full error:", err);
      console.error("Response:", err.response);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      alert(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setUpdating(false);
    }
  };

  const markAbsent = async (registration) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const studentId = registration.student?._id || registration.student;
      
      // Find and delete attendance record
      const attRecord = attendance.find(a => (a.student === studentId || a.student?._id === studentId));
      if (attRecord) {
        await API.delete(`/attendance/${attRecord._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Refresh data
      await fetchEventDetails(selectedEvent._id);
    } catch (err) {
      console.error("Error removing attendance:", err);
      alert(err.response?.data?.message || "Failed to remove attendance");
    } finally {
      setUpdating(false);
    }
  };

  const presentCount = registrations.filter(reg => getAttendanceStatus(reg.student?._id || reg.student) === "present").length;
  const absentCount = registrations.length - presentCount;

  if (loading) {
    return (
      <div className="dashboard-panel">
        <h2 className="panel-title">Attendance Management</h2>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Attendance Management</h2>
      
      {!selectedEvent ? (
        <div className="event-selection-container">
          <div className="selection-header-compact">
            <h3>Select Event</h3>
          </div>
          
          {events.length === 0 ? (
            <div className="empty-state-professional">
              <div className="empty-icon">📅</div>
              <h4>No Events Available</h4>
              <p>Create events to start managing attendance</p>
            </div>
          ) : (
            <div className="events-grid-professional">
              {events.map((event) => {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isCompleted = eventDate < today;
                
                return (
                  <div 
                    key={event._id} 
                    className={`event-card-professional ${isCompleted ? 'completed' : ''}`}
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="event-card-header">
                      {event.images && event.images.length > 0 ? (
                        <img 
                          src={
                            event.images[0].startsWith("http")
                              ? event.images[0]
                              : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${event.images[0]}`
                          }
                          alt={event.title}
                          className="event-card-image"
                        />
                      ) : (
                        <div className="event-card-placeholder">
                          <span>📅</span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="event-completed-overlay">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                    <div className="event-card-content">
                      <h4>{event.title}</h4>
                      <p className="event-date-professional">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {event.venue && (
                        <p className="event-venue">📍 {event.venue}</p>
                      )}
                      <p className="event-description-professional">{event.description}</p>
                    </div>
                    <div className="event-card-footer">
                      <span className="select-hint">Click to manage attendance</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="attendance-management-container">
          {/* Header with back button and event info */}
          <div className="management-header">
            <button 
              className="btn-back-professional"
              onClick={() => setSelectedEvent(null)}
            >
              ← Back to Events
            </button>
            <div className="selected-event-details">
              <h3>{selectedEvent.title}</h3>
              <p>{new Date(selectedEvent.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              {selectedEvent.venue && (
                <p className="event-venue">📍 {selectedEvent.venue}</p>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="attendance-stats-professional">
            <div className="stat-card-professional total">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{registrations.length}</div>
                <div className="stat-label">Total Registered</div>
              </div>
            </div>
            <div className="stat-card-professional present">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{presentCount}</div>
                <div className="stat-label">Present</div>
              </div>
            </div>
            <div className="stat-card-professional absent">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-number">{absentCount}</div>
                <div className="stat-label">Absent</div>
              </div>
            </div>
            <div className="stat-card-professional certificates">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-number">{presentCount}</div>
                <div className="stat-label">Certificates</div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          {registrations.length === 0 ? (
            <div className="empty-state-professional">
              <div className="empty-icon">👤</div>
              <h4>No Registrations</h4>
              <p>No students have registered for this event yet</p>
            </div>
          ) : (
            <div className="attendance-table-professional">
              <div className="table-header-professional">
                <h4>Student Attendance</h4>
                <p>Click buttons to mark attendance</p>
              </div>
              
              <div className="table-container-professional">
                <table className="professional-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Section</th>
                      <th>Branch</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => {
                      const studentId = reg.student?._id || reg.student;
                      const status = getAttendanceStatus(studentId);
                      
                      return (
                        <tr key={reg._id} className={`student-row ${status}`}>
                          <td>
                            <div className="student-info">
                              <div className="student-avatar">
                                {reg.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="student-name">{reg.name}</span>
                            </div>
                          </td>
                          <td>{reg.section}</td>
                          <td>{reg.branch}</td>
                          <td>
                            <span className={`status-badge ${status}`}>
                              {status === "present" ? "✅ Present" : "❌ Absent"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {status === "present" ? (
                                <button 
                                  className="btn-mark-absent"
                                  onClick={() => markAbsent(reg)}
                                  disabled={updating}
                                >
                                  Mark Absent
                                </button>
                              ) : (
                                <button 
                                  className="btn-mark-present"
                                  onClick={() => markPresent(reg)}
                                  disabled={updating}
                                >
                                  Mark Present
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendanceManagementPanel;