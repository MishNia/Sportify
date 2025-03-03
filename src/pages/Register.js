import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api"; // Import API function

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePassword = (password) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

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
    setConfirmPasswordError(newConfirmPassword !== password ? "Passwords do not match." : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || emailError || !password || passwordError || !confirmPassword || confirmPasswordError) {
      return;
    }

    const result = await signupUser(email, password);
    if (result.error) {
      setApiError(result.error);
    } else {
      alert("Signup successful! Redirecting to login.");
      navigate("/Profile");
    }
  };

  return (
      <div
          style={{
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "row",
          }}
      >
        {/* Left Branding Section */}
        <div
            style={{
              backgroundColor: "black",
              width: "32%",
              padding: "50px",
              opacity: "80%",
              color: "white",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
        >
          <div>
            <h1 style={{ fontSize: "80px", fontFamily: "sans-serif", marginBottom: "20px" }}>
              <i>SPORT!FY</i>
            </h1>
            <p style={{ fontSize: "20px" }}>
              Connect with friends and the world around you through sports. Find people who share your love for sports, join local
              events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you
              to the world of sports like never before!
            </p>
          </div>
        </div>

        {/* Right Signup Form Section */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "50px", width: "400px" }}>
            <h2 style={{ fontFamily: "sans-serif", fontSize: "30px", textAlign: "center" }}>Sign Up</h2>

            {apiError && <p style={{ color: "red", fontSize: "14px", textAlign: "center" }}>{apiError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Email Field */}
              <label>Email</label>
              <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              {emailError && <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>}

              {/* Password Field */}
              <label>Password</label>
              <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              {passwordError && <p style={{ color: "red", fontSize: "12px" }}>{passwordError}</p>}

              {/* Confirm Password Field */}
              <label>Confirm Password</label>
              <input
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm your password"
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              {confirmPasswordError && <p style={{ color: "red", fontSize: "12px" }}>{confirmPasswordError}</p>}

              {/* Register Button */}
              <button
                  type="submit"
                  disabled={emailError || passwordError || confirmPasswordError}
                  style={{
                    padding: "12px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: emailError || passwordError || confirmPasswordError ? "gray" : "black",
                    color: "white",
                    cursor: emailError || passwordError || confirmPasswordError ? "not-allowed" : "pointer",
                  }}
              >
                Register
              </button>
            </form>

            {/* Login Link */}
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
              Already a user?{" "}
              <a href="/login" style={{ color: "black", fontWeight: "bold", textDecoration: "none" }}>
                Log in here
              </a>
            </p>
          </div>
        </div>
      </div>
  );
}
