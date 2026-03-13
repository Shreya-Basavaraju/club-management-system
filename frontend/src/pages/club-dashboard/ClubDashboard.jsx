import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api/api";
import DashboardSidebar from "./DashboardSidebar";
import EventsPanel from "./EventsPanel";
import MembersPanel from "./MembersPanel";
import ClubInfoPanel from "./ClubInfoPanel";
import ManageEventsPanel from "./ManageEventsPanel";
import ManageMembersPanel from "./ManageMembersPanel";
import ManageRegistrationsPanel from "./ManageRegistrationsPanel";
import RegistrationPanel from "./RegistrationPanel";
import CertificatesPanel from "./CertificatesPanel";
import AttendanceManagementPanel from "./AttendanceManagementPanel";
import EventImagesPanel from "./EventImagesPanel";
import JoinRequestsPanel from "./JoinRequestsPanel";
import "../../styles/clubDashboard.css";

function ClubDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [activePanel, setActivePanel] = useState("events");
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  
  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubRes = await API.get(`/clubs/${id}`);
        setClub(clubRes.data);

        const eventsRes = await API.get(`/events/club/${id}`);
        setEvents(eventsRes.data);

        // Fetch members on initial load
        if (isAdmin) {
          await fetchMembers();
        }
      } catch (err) {
        console.error("Error fetching club data:", err);
      }
    };

    fetchData();
  }, [id, isAdmin]);

  useEffect(() => {
    if (activePanel === "members" && isAdmin) {
      fetchMembers();
    } else if (activePanel === "manage-members" && isAdmin) {
      fetchMembers();
    } else if (activePanel === "info") {
      // Fetch members for the info panel stats
      fetchMembers();
    }
  }, [activePanel, isAdmin, id]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/club-members/club/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "events":
        return <EventsPanel events={events} clubId={id} />;
      case "members":
        return isAdmin ? <MembersPanel members={members} isAdmin={isAdmin} /> : null;
      case "attendance":
        return isAdmin ? <AttendanceManagementPanel clubId={id} /> : null;
      case "registration":
        return !isAdmin ? <RegistrationPanel clubId={id} /> : null;
      case "certificates":
        return !isAdmin ? <CertificatesPanel clubId={id} /> : null;
      case "images":
        return <EventImagesPanel clubId={id} isAdmin={isAdmin} />;
      case "info":
        return <ClubInfoPanel club={club} eventsCount={events.length} membersCount={members.length} />;
      case "manage-events":
        return isAdmin ? <ManageEventsPanel clubId={id} events={events} setEvents={setEvents} /> : null;
      case "manage-members":
        return isAdmin ? <ManageMembersPanel clubId={id} members={members} fetchMembers={fetchMembers} /> : null;
      case "join-requests":
        return isAdmin ? <JoinRequestsPanel clubId={id} /> : null;
      default:
        return <EventsPanel events={events} clubId={id} />;
    }
  };

  if (!club) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="club-dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-brand">
          {/* JIT Logo */}
          <div className="jit-logo-container">
            <img 
              src="/jit-logo.png" 
              alt="JIT Logo" 
              className="jit-logo-image"
            />
          </div>
          
          {/* Club Logo */}
          {club.logo && (
            <img 
              src={
                club.logo.startsWith("http")
                  ? club.logo
                  : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${club.logo.startsWith('uploads/') ? club.logo : 'uploads/' + club.logo}`
              }
              alt={club.name}
              className="club-logo-header"
            />
          )}
          
          <div className="brand-text">
            <h1>
              <span className="brand-icon-small">🎓</span>
              Club Connect
            </h1>
            <p className="dashboard-subtitle">Jyothy Institute of Technology - {club.name}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <DashboardSidebar 
          activePanel={activePanel} 
          setActivePanel={setActivePanel}
          isAdmin={isAdmin}
        />
        
        <div className="dashboard-main-content">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}

export default ClubDashboard;
