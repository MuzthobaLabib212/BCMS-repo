import React, { useState } from 'react';
import { auth, db } from "../firebaseconfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import AuthContainer from './AuthContainer';
import './Write.css';

function WriteWithNewAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isAdminLogin) {
        // Admin login from database
        const adminRef = ref(db, `Admin/${email}`);
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
          const adminData = snapshot.val();
          if (adminData.password === password) {
            localStorage.setItem('currentUser', JSON.stringify({ ...adminData, uid: email, isAdmin: true }));
            navigate("/home");
            return;
          } else {
            setError("Invalid admin ID or password.");
            return;
          }
        } else {
          setError("Admin not found.");
          return;
        }
      } else {
        // Regular user login with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Realtime Database
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          localStorage.setItem('currentUser', JSON.stringify({ ...userData, uid: user.uid }));
          navigate("/home");
        } else {
          setError("User data not found.");
        }
      }
    } catch (error) {
      setError("Error logging in: " + error.message);
    } finally {
      setLoading(false);
      // Clear input fields after login attempt
      setEmail("");
      setPassword("");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      setError("Error sending reset email: " + error.message);
    }
  };

  return (
    <AuthContainer title="Login to Cafeteria">
      {error && <div className="error-message">{error}</div>}

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type={isAdminLogin ? "text" : "email"}
          placeholder={isAdminLogin ? "Admin ID" : "Email"}
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={isAdminLogin ? "Admin Password" : "Password"}
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>
        <input
          type="checkbox"
          checked={isAdminLogin}
          onChange={(e) => {
            setIsAdminLogin(e.target.checked);
            // Clear input fields when toggling admin login checkbox
            setEmail("");
            setPassword("");
          }}
        />
        Admin Login
        </label>
        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-link">
        <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
      </div>
      <div className="auth-link">
        Don't have an account?{' '}
        <a href="#" onClick={() => navigate("/register")}>Sign up here</a>
      </div>
    </AuthContainer>
  );
}

export default WriteWithNewAuth;
