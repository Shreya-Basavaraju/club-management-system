import { Link } from "react-router-dom";
import "../../styles/admin.css";

function AdminDashboard() {
  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>

      <div className="admin-actions">
        <Link to="/admin/add-club">➕ Add Club</Link>
        <Link to="/admin/add-event">📅 Add Event</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;