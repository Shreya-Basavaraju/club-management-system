import { useEffect, useState } from "react";
import API from "../api/api";
import ClubCard from "../components/ClubCard";
import AddClubModal from "./admin/AddClubModal";

function Dashboard() {
  const [clubs, setClubs] = useState([]);
  const [showAddClub, setShowAddClub] = useState(false);

  const isAdmin = localStorage.getItem("role") === "admin";

  const loadClubs = () => {
    API.get("/clubs").then(res => setClubs(res.data));
  };

  useEffect(() => {
    loadClubs();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Explore Clubs</h2>

      {isAdmin && (
        <button onClick={() => setShowAddClub(true)}>+ Add Club</button>
      )}

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "20px"
        }}
      >
        {clubs.map(club => (
          <ClubCard
            key={club._id}
            club={club}
            isAdmin={isAdmin}
            onDelete={loadClubs}
          />
        ))}
      </div>

      {showAddClub && (
        <AddClubModal
          onClose={() => setShowAddClub(false)}
          onAdded={loadClubs}
        />
      )}
    </div>
  );
}

export default Dashboard;