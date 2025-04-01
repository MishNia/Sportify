import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Validate Email
    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (!validatePassword(newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters long, include an uppercase, lowercase, number, and a special character."
      );
    } else {
      setPasswordError("");
    }
  };

  // Handle Confirm Password Change
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    if (newConfirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const isDisabled = !email || emailError ||
    !password || passwordError ||
    !confirmPassword || confirmPasswordError;

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/v1/auth/google';
  };

  return (
    <div style={{
      backgroundImage: "url('/sports.jpg')", backgroundSize: "cover",  backgroundPosition: 'center',

    }} >
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
        {/* Left Section with Branding & Background */}
        <div style={{ backgroundColor: "black", width: '32%', padding:"50px",opacity: "80%", color: "white",alignContent:"center" ,textAlign: "center", justifyContent:"center" }} className="relative w-1/2 flex flex-col justify-center items-center text-white p-10">
          
          <div  className="relative z-10 text-center">
            <h1 style={{fontSize:"80px", fontFamily:"sans-serif", marginBottom:"20px"}}><i>SPORT!FY</i></h1>
            <p style={{fontSize:"20px"}}>
              Connect with friends and the world around you through sports. Find people who share your love for sports, join local events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you to the world of sports like never before!
            </p>
          </div>
        </div>


        {/* Right Section with Sign-Up Form */}
        <div style={{ flex: 1, }} >
          <div style={{ backgroundColor: "white", borderRadius: "10px", margin: "150px 200px", padding: "50px" }}>
            <div><h2 style={{ margin: "0px", fontFamily:"sans-serif", fontSize:"30px" }} >Sign Up</h2></div>

            {/* Sign-Up Form */}
            <form style={{ display: "flex", alignItems: "center", textAlign: "left", padding: "20px", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", padding: "15px 0px", alignItems: "center", justifyContent: "space-between", flex: 2, width: "100%" }}>
                  <label style={{  width: "40%",textAlign: "left" }} className="block text-gray-700 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    style={{ width: "40%" }} 
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4"
                  /></div>{emailError && <p style={{ margin:"0px 0px 0px 15px",color: "red", fontSize: "10px" }}>{emailError}</p>}
              </div>


              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", padding: "15px 0px", alignItems: "center", justifyContent: "space-between", width: "100%", flex: 2}}>
                  <label style={{width: "40%",  textAlign: "left" }} >Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className="border rounded-md focus:outline-none "
                    style={{ width: "40%" }} 

                  /> 
                </div>{passwordError && <p style={{ margin:"0px 0px 0px 5px",color: "red", fontSize: "10px" }}>{passwordError}</p>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", padding: "15px 0px", alignItems: "center", justifyContent: "space-between", width: "100%", flex: 2 }}><label style={{ width: "40%",textAlign: "left" }} className="block text-gray-700 font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm your password"
                    className="border rounded-md"
                    style={{ width: "40%" }} 
                  /></div>{confirmPasswordError && <p style={{ margin:"0px 0px 0px 15px",color: "red", fontSize: "10px" }}>{confirmPasswordError}</p>}</div>


            </form>

            {/* Google Sign-In Button */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                onClick={handleGoogleSignIn}
                style={{
                  padding: "10px",
                  width: "300px",
                  borderRadius: "5px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  style={{ width: "20px", height: "20px" }}
                />
                Sign in with Google
              </button>
            </div>

            {/* Register Button */}
            <div style={{ marginTop: "20px" }}>
              <button 
                className="button" 
                style={{
                  padding: "10px", 
                  width: "300px", 
                  borderRadius: "5px",
                  backgroundColor: "#000",
                  color: "white",
                  border: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.5 : 1
                }} 
                disabled={isDisabled} 
                onClick={(e) => { e.preventDefault(); navigate("/Profile") }}
              >
                Register
              </button>
            </div>

            {/* Login Link */}
            <p className="text-gray-600 text-sm text-center mt-4">
              Already a user? <a href="/login" className="text-black font-medium">Log in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}