import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../api"; // Import API function
import "./Profile.css"; // Ensure this CSS file exists
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        age: 0,
        gender: "",
        sport_preference: [],
    });

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

        const result = await createProfile(formData);

        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            // Update auth context with the new profile
            login(localStorage.getItem("token"), { profile: result });
            alert("Profile created successfully!");
            navigate("/Home");
        }
    };

    return (
        <div className="profile-container">
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
                {/* Left Branding Section */}
                <div style={{ backgroundColor: "black", width: '32%', padding: "50px", opacity: "80%", color: "white", alignContent: "center", textAlign: "center", justifyContent: "center" }} className="relative w-1/2 flex flex-col justify-center items-center text-white p-10">
                    <div className="relative z-10 text-center">
                        <h1 style={{ fontSize: "80px", fontFamily: "sans-serif", marginBottom: "20px" }}><i>SPORT!FY</i></h1>
                        <p style={{ fontSize: "20px" }}>
                            Connect with friends and the world around you through sports. Find people who share your love for sports, join local events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you to the world of sports like never before!
                        </p>
                    </div>
                </div>

                {/* Right Profile Form Section */}
                <div style={{ flex: 1 }} className="profile-right">
                    <form className="profile-box" onSubmit={handleSubmit}>
                        <h2>Profile</h2>

                        {error && <p style={{ color: "red", fontSize: "14px", textAlign: "center" }}>{error}</p>}

                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="Enter first name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />

                        <label>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Enter last name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />

                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            placeholder="Enter age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                        />

                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="" disabled>Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Others">Others</option>
                        </select>

                        <label>Sports Preferences</label>
                        <div className="dropdown">
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

                        <button style={{ marginTop: "20px" }} type="submit" className="profile-button" disabled={loading}>
                            {loading ? "Saving..." : "Let's Play"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}