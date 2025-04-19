import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api";
import "./Main.css";
import "./MyProfile.css";

export default function MyProfile() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const result = await getUserProfile();
                console.log('Profile data from API:', result);
                
                if (!result.error) {
                    // Check if the result has a data property (from API response)
                    const profile = result.data || result;
                    setProfileData(profile);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, []);

    // Handle navigation
    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Navigation Bar */}
            <nav style={{ background: 'black', height: '60px', display: 'flex', padding: '0px', flexDirection: 'row' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '40%',
                    backgroundColor: 'black',
                }}>
                    <img style={{ width: "50px", paddingRight: "10px" }} src="/iconmain.png" alt={"sportify"} />
                    <p style={{
                        margin: '0',
                        padding: '0',
                        color: 'white',
                        fontSize: '40px',
                        fontFamily: 'initial'
                    }}>
                        SPORT!FY
                    </p>
                </div>
                <div style={{ flex: 2, display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                    <div style={{ flex: 3, height: '100%', width: '100%' }}><button className="button" onClick={() => handleNavigate("/Home")}>Home</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => handleNavigate("/find")}>Find</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button">Friends</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => handleNavigate("/MyProfile")}>Profile</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}>
                        <button
                            className="button"
                            onClick={() => handleNavigate("/create-event")}
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                padding: '0 20px'
                            }}
                        >
                            +
                        </button>
                    </div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}>
                        <button className="button" id="but3" onClick={() => {
                            localStorage.removeItem("token");
                            handleNavigate("/login");
                        }}>Sign Out</button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundImage: "url('/sports.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {/* Profile Card */}
                <div style={{
                    backgroundColor: "white",
                    marginTop: "50px",
                    marginBottom: "50px",
                    padding: "30px",
                    borderRadius: "15px",
                    width: "80%",
                    maxWidth: "800px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ textAlign: "center", marginBottom: "30px" }}>My Profile</h2>
                    
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <p>Loading profile data...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
                            <p>{error}</p>
                            <button 
                                onClick={() => handleNavigate("/Profile")}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginTop: "20px"
                                }}
                            >
                                Create Profile
                            </button>
                        </div>
                    ) : profileData ? (
                        <div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                                <div style={{ flex: "1", minWidth: "300px" }}>
                                    <h3>Personal Information</h3>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Name</p>
                                        <p>{profileData.first_name} {profileData.last_name}</p>
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Email</p>
                                        <p>{profileData.email}</p>
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Age</p>
                                        <p>{profileData.age}</p>
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>Gender</p>
                                        <p>{profileData.gender}</p>
                                    </div>
                                </div>
                                
                                <div style={{ flex: "1", minWidth: "300px" }}>
                                    <h3>Sports Preferences</h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                        {profileData.sport_preference && profileData.sport_preference.map((sport, index) => (
                                            <span 
                                                key={index}
                                                style={{
                                                    backgroundColor: "#f0f0f0",
                                                    padding: "5px 10px",
                                                    borderRadius: "15px",
                                                    display: "inline-block"
                                                }}
                                            >
                                                {sport}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: "30px", textAlign: "center" }}>
                                <button 
                                    onClick={() => handleNavigate("/Profile")}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <p>No profile found. Please create a profile.</p>
                            <button 
                                onClick={() => handleNavigate("/Profile")}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginTop: "20px"
                                }}
                            >
                                Create Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
