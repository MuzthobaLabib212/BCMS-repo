import React, { useState } from 'react';
import { auth, db } from "../firebaseconfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import AuthContainer from './AuthContainer';

function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate a unique serial number for the user
      const serialRef = ref(db, 'userSerialCounter');
      const serialSnapshot = await get(serialRef);
      let serialNumber = 1;
      if (serialSnapshot.exists()) {
        serialNumber = serialSnapshot.val() + 1;
      }
      await set(serialRef, serialNumber);

      // Save additional user data to Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: "user",
        serialNumber: serialNumber.toString().padStart(3, '0'), // e.g., 001, 002
        createdAt: new Date().toISOString()
      });

      alert("Account created successfully! Please login.");

      navigate("/");
    } catch (error) {
      setError("Error creating account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Create Account">
      {error && <div className="error-message">{error}</div>}
      <form className="auth-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="First Name"
          className="auth-input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          className="auth-input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <div className="auth-link">
        Already have an account?{' '}
        <a href="#" onClick={() => navigate("/")}>Login here</a>
      </div>
    </AuthContainer>
  );
}

export default Register;
