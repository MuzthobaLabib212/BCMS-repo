import React, { useState } from 'react';
import app from "../firebaseconfig";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import AuthContainer from './AuthContainer';
import './Write.css';

function Write() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [loginType, setLoginType] = useState("user"); // "user" or "admin"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const db = getDatabase(app);

      if (loginType === "admin") {
        // Admin login logic
        const adminRef = ref(db, 'adminUsers');
        const adminSnapshot = await get(adminRef);

        if (!adminSnapshot.exists()) {
          setError("Admin system not configured. Please contact system administrator.");
          setLoading(false);
          return;
        }

        const adminUsers = adminSnapshot.val();
        const adminUser = Object.values(adminUsers).find(admin =>
          admin.adminId === adminId && admin.password === password
        );

        if (adminUser) {
          // Store admin info in localStorage for session management
          localStorage.setItem('currentUser', JSON.stringify({
            ...adminUser,
            role: 'admin'
          }));
          navigate("/admin");
        } else {
          setError("Invalid admin ID or password");
        }
      } else {
        // Regular user login logic
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
          setError("No users found. Please sign up first.");
          setLoading(false);
          return;
        }

        const users = snapshot.val();
        const user = Object.values(users).find(user =>
          user.email === email && user.password === password
        );

        if (user) {
          // Store user info in localStorage for session management
          localStorage.setItem('currentUser', JSON.stringify(user));
          navigate("/home");
        } else {
          setError("Invalid email or password");
        }
      }
    } catch (error) {
      setError("Error logging in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Login to Cafeteria">
      {error && <div className="error-message">{error}</div>}

      {/* Login Type Toggle */}
      <div className="login-type-toggle">
        <label className="login-type-label">
          <input
            type="radio"
            value="user"
            checked={loginType === "user"}
            onChange={(e) => setLoginType(e.target.value)}
          />
          <span className="radio-custom"></span>
          User Login
        </label>
        <label className="login-type-label">
          <input
            type="radio"
            value="admin"
            checked={loginType === "admin"}
            onChange={(e) => setLoginType(e.target.value)}
          />
          <span className="radio-custom"></span>
          Admin Login
        </label>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        {loginType === "admin" ? (
          <input
            type="text"
            placeholder="Admin ID"
            className="auth-input"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            required
          />
        ) : (
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : `Login as ${loginType === "admin" ? "Admin" : "User"}`}
        </button>
      </form>
      <div className="auth-link">
        Don't have an account?{' '}
        <a href="#" onClick={() => navigate("/register")}>Sign up here</a>
      </div>
    </AuthContainer>
  );
}

export default Write;
