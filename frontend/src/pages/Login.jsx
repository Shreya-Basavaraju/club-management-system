import { useState } from "react";
import API from "../api/api";
import "../styles/auth.css";

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate email domain
    if (!email.endsWith("@jit.ac.in")) {
      alert("Not valid email. Please use your @jit.ac.in email address.");
      return;
    }
    
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      window.location.href = "/home";
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      alert(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header-outside">
        <h1 className="auth-brand-outside">
          <span className="auth-icon">🎓</span>
          Club Connect
        </h1>
      </div>
      
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Login</h2>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <p>
          Don’t have an account?{" "}
          <span onClick={() => (window.location.href = "/signup")}>
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;