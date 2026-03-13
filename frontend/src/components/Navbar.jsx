import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar" style={{ display: "flex", justifyContent: "space-between" }}>
      <div>Club Management System</div>
      <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
        Login
      </Link>
    </div>
  );
};

export default Navbar;