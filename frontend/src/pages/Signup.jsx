import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import "../styles/auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Generate a strong password
  const generateStrongPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 0; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Check password strength
  const checkPasswordStrength = (pwd) => {
    if (pwd.length === 0) {
      setPasswordStrength("");
      setShowSuggestion(false);
      return;
    }

    let strength = 0;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength <= 2) {
      setPasswordStrength("weak");
      setShowSuggestion(true);
      setSuggestedPassword(generateStrongPassword());
    } else if (strength === 3 || strength === 4) {
      setPasswordStrength("medium");
      setShowSuggestion(false);
    } else {
      setPasswordStrength("strong");
      setShowSuggestion(false);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const useSuggestedPassword = () => {
    setPassword(suggestedPassword);
    checkPasswordStrength(suggestedPassword);
    setShowSuggestion(false);
    setShowPassword(true); // Show password so user can see it
    
    // Ask user if they want to copy/save the password
    setTimeout(() => {
      const shouldCopy = window.confirm(
        "Would you like to copy this password to clipboard?\n\n" +
        "Password: " + suggestedPassword + "\n\n" +
        "⚠️ Make sure to save it somewhere safe!"
      );
      if (shouldCopy) {
        copyPasswordToClipboard(suggestedPassword);
      }
    }, 100);
  };

  const copyPasswordToClipboard = (pwd) => {
    navigator.clipboard.writeText(pwd).then(() => {
      setCopiedPassword(true);
      alert("✓ Password copied to clipboard! Please save it in a safe place.");
      setTimeout(() => setCopiedPassword(false), 3000);
    }).catch(() => {
      alert("Failed to copy password. Please copy it manually: " + pwd);
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate email domain
    if (!email.endsWith("@jit.ac.in")) {
      alert("Not valid email. Please use your @jit.ac.in email address.");
      return;
    }

    // Warn if password is weak
    if (passwordStrength === "weak") {
      const proceed = window.confirm("Your password is weak. Do you want to continue anyway? We recommend using a stronger password.");
      if (!proceed) return;
    }

    try {
      const response = await API.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });

      console.log("Signup response:", response.data);
      alert(response.data.message || "Signup successful. Please login.");
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error response:", err.response);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Signup failed. Please try again.";
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
      
      <form className="auth-card" onSubmit={handleSignup}>
        <h2>Sign Up</h2>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-field-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {passwordStrength && (
            <div className={`password-strength ${passwordStrength}`}>
              <div className="strength-bar">
                <div className={`strength-fill ${passwordStrength}`}></div>
              </div>
              <span className="strength-text">
                {passwordStrength === "weak" && "Weak Password"}
                {passwordStrength === "medium" && "Medium Password"}
                {passwordStrength === "strong" && "Strong Password"}
              </span>
            </div>
          )}
          {showSuggestion && (
            <div className="password-suggestion">
              <p className="suggestion-text">
                ⚠️ Your password is weak. Use a strong password with:
              </p>
              <ul className="suggestion-list">
                <li>At least 8 characters</li>
                <li>Uppercase & lowercase letters</li>
                <li>Numbers and special characters</li>
              </ul>
              <div className="suggested-password-box">
                <p className="suggestion-label">Suggested strong password:</p>
                <div className="suggested-password-display">
                  <code>{suggestedPassword}</code>
                  <button 
                    type="button" 
                    className="btn-use-suggested"
                    onClick={useSuggestedPassword}
                  >
                    Use This
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit">Create Account</button>

        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;