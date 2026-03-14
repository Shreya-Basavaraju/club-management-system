import { useState, useEffect } from "react";
import API from "../api/api";
import "../styles/auth.css";

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverWaking, setServerWaking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ping backend on mount to wake up Render free tier
  useEffect(() => {
    let timer;
    const controller = new AbortController();

    const ping = async () => {
      try {
        const start = Date.now();
        timer = setTimeout(() => setServerWaking(true), 3000);
        await API.get("/health", { signal: controller.signal });
        clearTimeout(timer);
        setServerWaking(false);
      } catch {
        clearTimeout(timer);
        setServerWaking(false);
      }
    };

    ping();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@jit.ac.in")) {
      alert("Not valid email. Please use your @jit.ac.in email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password, role });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      window.location.href = "/home";
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {serverWaking && (
        <div className="server-waking-banner">
          ⏳ Server is starting up, please wait a moment...
        </div>
      )}

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

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <span onClick={() => (window.location.href = "/signup")}>
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
