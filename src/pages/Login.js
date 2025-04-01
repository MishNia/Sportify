import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Make sure to create this CSS file for styling

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data);
                navigate('/home');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
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
                                placeholder="enter email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <label>Password</label>
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {error && <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>{error}</p>}

                            <button type="submit" className="login-button">
                                login
                            </button>
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

                        <p className="new-user">
                            New user? <span onClick={() => navigate("/register")}>Click here</span>
                        </p>
                        <p className="forgot-password">
                            <span onClick={() => navigate("/forgotpass")}>forgot password</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
