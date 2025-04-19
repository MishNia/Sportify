import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Make sure to create this CSS file for styling
import { loginUser } from "../api"; // Import API function
import { useAuth } from "../context/AuthContext";
import{jwtDecode} from 'jwt-decode';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login, checkUserProfile } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await loginUser(email, password);

        if (result.error) {
            setError(result.error);
        } else {
            localStorage.setItem("token", result.data);

            const decoded=jwtDecode(localStorage.getItem("token"));
            const userId=decoded.sub;
            console.log("User ID:",userId);
            localStorage.setItem("userId", userId);

            alert("Login successful!");
            // Check if user has a profile using the context function
            const hasProfile = await checkUserProfile();

            if (hasProfile) {
                // User has a profile, go to home page
                console.log('User has a profile, redirecting to home');
                navigate("/Home");
            } else {
                // User doesn't have a profile, go to profile creation page
                console.log('User needs to create a profile');
                navigate("/Profile");
            }
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = 'http://localhost:8080/v1/auth/google';
    };

    return (
        <div className="login-container">
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
                <div style={{ backgroundColor: "black", width: '32%', padding: "50px", opacity: "80%", color: "white", alignContent: "center", textAlign: "center", justifyContent: "center" }} className="relative w-1/2 flex flex-col justify-center items-center text-white p-10">

                    <div className="relative z-10 text-center">
                        <h1 style={{ fontSize: "80px", fontFamily: "sans-serif", marginBottom: "20px" }}><i>SPORT!FY</i></h1>
                        <p style={{ fontSize: "20px" }}>
                            Connect with friends and the world around you through sports. Find people who share your love for sports, join local events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you to the world of sports like never before!
                        </p>
                    </div>
                </div>

                <div style={{ flex: 1, }} className="login-right">
                    <div className="login-box">
                        <h2>Sign in</h2>

                        <form onSubmit={handleLogin}>
                            <label>Email</label>
                            <input 
                                type="email" 
                                placeholder="Enter email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <label>Password</label>
                            <input 
                                type="password" 
                                placeholder="Enter Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {error && (<div className="validation-message" style={{marginBottom:"10px"}}> <span style={{ fontSize: "14px", lineHeight: "1" }}>⚠️</span> {error}</div>)}
                            <p className="forgot-password">
                            <span onClick={() => navigate("/forgotpass")} className="forgot-text">Forgot password?</span>
                            </p>
                            <button type="submit" className="login-button">
                                Login
                            </button>
                        </form>
                        <p style={{alignContent:"center"}}>or</p>

                        {/* Google Sign-In Button */}
                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                            <button
                                className="SSO-button"
                                onClick={handleGoogleSignIn}
                                
                            >
                                <img
                                    src="https://www.google.com/favicon.ico"
                                    alt="Google"
                                    style={{ width: "20px", height: "20px" }}
                                />
                                Sign in with Google
                            </button>
                        </div>

                        <p className="new-user">
                            New user? <span onClick={() => navigate("/register")} className="click-text">Click here</span>
                        </p>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
