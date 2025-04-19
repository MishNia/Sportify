import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api";
import "./Register.css"; // Reuse the same styling as Login

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const isDisabled =
    !email ||
    emailError ||
    !password ||
    passwordError ||
    !confirmPassword ||
    confirmPasswordError;

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail) ? "" : "Please enter a valid email address.");
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(
      validatePassword(newPassword)
        ? ""
        : "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
    );
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordError(
      newConfirmPassword !== password ? "Passwords do not match." : ""
    );
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/v1/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDisabled) return;

    const result = await signupUser(email, password);
    if (result.error) {
      setApiError(result.error);
    } else {
      localStorage.setItem("token", result.data);
      alert("Signup successful! Redirecting to profile.");
      navigate("/profile");
    }
  };

  return (
    <div className="login-container">
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
        {/* Branding Section */}
        <div
          style={{
            backgroundColor: "black",
            width: "32%",
            padding: "50px",
            opacity: "80%",
            color: "white",
            alignContent: "center",
            textAlign: "center",
            justifyContent: "center",
          }}
          className="relative w-1/2 flex flex-col justify-center items-center text-white p-10"
        >
          <div className="relative z-10 text-center">
            <h1 style={{ fontSize: "80px", fontFamily: "sans-serif", marginBottom: "20px" }}>
              <i>SPORT!FY</i>
            </h1>
            <p style={{ fontSize: "20px" }}>
              Connect with friends and the world around you through sports. Find people who share your love for sports, join local events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you to the world of sports like never before!
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div style={{ flex: 1 }} className="login-right">
          <div className="login-box">
            <h2>Sign Up</h2>
            {apiError && <p style={{ color: "red", fontSize: "14px", textAlign: "center" }}>{apiError}</p>}

            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
              />
              {emailError && (<div className="validation-message"> <span style={{ fontSize: "14px", lineHeight: "1" }}>⚠️</span> {emailError}</div>)}

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              {passwordError && (<div className="validation-message"> <span style={{ fontSize: "14px", lineHeight: "1" }}>⚠️</span> {passwordError}</div>)}

              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {confirmPasswordError && (<div className="validation-message"> <span style={{ fontSize: "14px", lineHeight: "1" }}>⚠️</span> {confirmPasswordError}</div>)}

              <button
                type="submit"
                className="login-button"
                style={{
                  backgroundColor: isDisabled ? "gray" : "black",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
                disabled={isDisabled}
              >
                Register
              </button>
            </form>

            <p style={{ textAlign: "center", margin: "10px 0" }}>or</p>

            <div style={{ textAlign: "center" }}>
              <button className="SSOR-button" onClick={handleGoogleSignIn}>
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  style={{ width: "20px", height: "20px" }}
                />
                Sign in with Google
              </button>
            </div>

            <p className="new-user">
              Already a user?{" "}
              <span onClick={() => navigate("/login")} className="click-text">
                Log in here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
