import { useState, useEffect } from "react";
import API from "../../api/api";

function ManageRegistrationsPanel({ clubId }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedByEvent, setGroupedByEvent] = useState({});

  useEffect(() => {
    fetchRegistrations();
  }, [clubId]);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Get all events for this club
      const eventsRes = await API.get(`/events/club/${clubId}`);
      const events = eventsRes.data;

      if (!events || events.length === 0) {
        setLoading(false);
        return;
      }

      // Get registrations for each event
      const allRegistrations = [];
      for (const event of events) {
        try {
          const regRes = await API.get(`/registrations/event/${event._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (regRes.data && Array.isArray(regRes.data)) {
            allRegistrations.push(...regRes.data.map(reg => ({
              ...reg,
              event: event
            })));
          }
        } catch (err) {
          console.error(`Error fetching registrations for event ${event._id}:`, err);
          // Continue with other events even if one fails
        }
      }

      setRegistrations(allRegistrations);

      // Group by event
      const grouped = {};
      allRegistrations.forEach(reg => {
        const eventId = reg.event._id;
        if (!grouped[eventId]) {
          grouped[eventId] = {
            event: reg.event,
            registrations: []
          };
        }
        grouped[eventId].registrations.push(reg);
      });
      setGroupedByEvent(grouped);

    } catch (err) {
      console.error("Error fetching registrations:", err);
      alert("Failed to load registrations. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-panel">
        <h2 className="panel-title">Event Registrations</h2>
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Event Registrations</h2>
      
      {Object.keys(groupedByEvent).length === 0 ? (
        <div className="empty-state">
          <p>No registrations yet.</p>
        </div>
      ) : (
        <div className="registrations-by-event">
          {Object.values(groupedByEvent).map(({ event, registrations }) => (
            <div key={event._id} className="event-registrations-section">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className="registration-count">
                  {registrations.length} {registrations.length === 1 ? 'Registration' : 'Registrations'}
                </span>
              </div>
              
              <div className="registrations-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Section</th>
                      <th>Branch</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg._id}>
                        <td>{reg.name}</td>
                        <td>{reg.section}</td>
                        <td>{reg.branch}</td>
                        <td>
                          {new Date(reg.createdAt).toLocaleDateString('en-US', {
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageRegistrationsPanel;
