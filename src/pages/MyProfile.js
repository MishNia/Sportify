import React, { useState, useEffect } from "react";
import { useNavigate, } from "react-router-dom"
import { createProfile, getUserProfile, updateProfile } from "../api";
import "./Main.css";
import "./MyProfile.css";
import { useAuth } from "../context/AuthContext";

export default function MyProfile() {
    const navigate = useNavigate();
    const { userProfile, logout, updateUserProfile } = useAuth();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        age: 0,
        gender: "",
        sport_preference: [],
    });

    // Load user profile data when component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userProfile) {
                const result = await getUserProfile();
                if (!result.error) {
                    updateUserProfile(result);
                    setFormData({
                        first_name: result.first_name || "",
                        last_name: result.last_name || "",
                        age: result.age || 0,
                        gender: result.gender || "",
                        sport_preference: result.sport_preference || [],
                    });
                }
            } else {
                setFormData({
                    first_name: userProfile.first_name || "",
                    last_name: userProfile.last_name || "",
                    age: userProfile.age || 0,
                    gender: userProfile.gender || "",
                    sport_preference: userProfile.sport_preference || [],
                });
            }
        };

        fetchProfile();
    }, [userProfile, updateUserProfile]);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const sportsOptions = ["Football", "Basketball", "Tennis", "Cricket", "Soccer", "Baseball"];

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "age" ? Number(value) : value, });
    };

    // Handle Sports Selection
    const handleSportsChange = (sport) => {
        const updatedSports = formData.sport_preference.includes(sport)
            ? formData.sport_preference.filter((s) => s !== sport) // Remove if already selected
            : [...formData.sport_preference, sport]; // Add if not selected

        setFormData({ ...formData, sport_preference: updatedSports });
    };

    // Submit Handler with API Call
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");  // Reset previous error messages
        setLoading(true);

        let result;
        if (userProfile) {
            // Update existing profile
            result = await updateProfile(formData);
            if (!result.error) {
                updateUserProfile(result);
            }
        } else {
            // Create new profile
            result = await createProfile(formData);
            if (!result.error) {
                updateUserProfile(result);
            }
        }

        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            alert(userProfile ? "Profile updated successfully!" : "Profile created successfully!");
            navigate("/Home");
        }
    };
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <nav style={{ background: 'black', height: '60px', display: 'flex', padding: '0px', flexDirection: 'row' }} className="navbar">
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
                <div style={{ flex: 2, display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }} className="flex">
                    <div style={{ flex: 3, height: '100%', width: '100%' }}><button className="button" onClick={() => navigate("/Home")}>Home</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => navigate("/Find")}>Find</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button">Friends</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => navigate("/MyProfile")}>Profile</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}>
                        <button
                            className="button"
                            onClick={() => navigate("/create-event")}
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                padding: '0 20px'
                            }}
                        >
                            +
                        </button>
                    </div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" id="but3" onClick={() => {
                        logout();
                        navigate("/login");
                    }}>Sign Out</button></div>
                </div>
            </nav>
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection:"column",
                backgroundImage: "url('/sports.jpg')", backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%", // Full screen height
                width: "100%",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{
                    backgroundColor: "white",
                    marginTop: "50px",
                    marginBottom: "50px",
                    height: "370px",
                    width: "1200px",
                    borderRadius: "15px",
                    flex:1,
                }}>
                    <form style={{ display: "flex", flexWrap: "wrap", }} onSubmit={handleSubmit}>
                        <h2 style={{ flex: "100%" }}>Profile</h2>

                        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

                        <label style={{ paddingLeft: "100px", textAlign: "initial", flex: "15%", marginTop: "20px", }}>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="Sonika"
                            style={{ width: "200px", flex: "20%", marginTop: "20px", marginRight: "50px" }}
                            value={formData.first_name}
                            onChange={handleChange}
                            required

                        />

                        <label style={{ paddingLeft: "50px", textAlign: "initial", flex: "15%", marginTop: "20px" }}>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Yeada"
                            style={{ width: "200px", flex: "20%", marginTop: "20px" }}
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />

                        <label style={{ paddingLeft: "100px", textAlign: "initial", flex: "15%", marginTop: "20px" }}>Age</label>
                        <input
                            type="number"
                            name="age"
                            placeholder="23"
                            style={{ width: "200px", flex: "20%", marginTop: "20px", marginRight: "50px" }}
                            // value={formData.age}
                            onChange={handleChange}
                            required
                        />

                        <label style={{ paddingLeft: "50px", textAlign: "initial", flex: "15%", marginTop: "20px" }}>Gender</label>
                        <select placeholder="Female" style={{ width: "200px", flex: "20%", marginTop: "20px" }} name="gender" value={formData.gender} onChange={handleChange} required>
                            {/* <option value="" disabled>Select Gender</option> */}
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Others">Others</option>
                        </select>

                        <label style={{ paddingLeft: "100px", textAlign: "initial", flex: "15%", marginTop: "20px" }}>Sports Preferences</label>
                        <div style={{ width: "200px", flex: "20%", marginTop: "20px", marginRight: "50px" }} className="dropdown">
                            <button
                                type="button"

                                className="dropdown-button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                Select Sports ▾
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown-content">
                                    {sportsOptions.map((sport) => (
                                        <label key={sport} className="dropdown-item">
                                            <input
                                                type="checkbox"
                                                checked={formData.sport_preference.includes(sport)}
                                                onChange={() => handleSportsChange(sport)}
                                            />
                                            <span>{sport}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ flex: "100%", justifyContent: "center" }}>
                            <button style={{ marginTop: "20px", width: "300px" }} type="submit" className="profile-button" disabled={loading}>
                                {loading ? "Saving..." : "Update"}
                            </button>
                        </div>
                    </form>


                </div>
                <div style={{backgroundColor: "white",
                    marginBottom: "50px",
                    height: "250px",
                    width: "1200px"}}>
                    <div style={{display:"flex" ,flex:1}}>
                        <div style={{ flex:"33.33%", borderRadius: "15px", height:"50px"}}>
                            <button className="eventDisplay">Joined Events</button>
                        </div>
                        <div style={{ flex:"33.33%",height:"50px"}}>
                            <button className="eventDisplay" >Upcoming Events</button>
                        </div>
                        <div style={{ flex:"33.33%", borderRadius: "15px",height:"50px"}}>
                            <button className="eventDisplay">My Events</button>
                        </div>
                    </div>
                    <div style={{width:"100%",justifyContent:"center"}}>
                        <h4>no events currently</h4>
                    </div>
                </div>

            </div>
        </div>
    );
}