import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindTeams.css"; // Ensure to create CSS for styling

export default function FindTeams() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const teams = [
        { id: 1, name: "Basketball Game", date: "12th Feb, 2025", time: "5:00 pm", location: "Recsports, Gainesville, FL" },
        { id: 2, name: "Beach Tennis", date: "15th Feb, 2025", time: "10:00 am", location: "Paul Beach, St. Augustine, FL" },
        { id: 3, name: "Soccer Night", date: "16th Feb, 2025", time: "8:00 pm", location: "Recsports, Gainesville, FL" },
        { id: 4, name: "Soccer at Deviant Park", date: "16th Feb, 2025", time: "10:00 pm", location: "Deviant Park, Jacksonville, FL" },
    ];

    // Filter teams based on search input
    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="find-teams-container">
            <nav className="navbar">
                <p className="logo" onClick={() => navigate("/")}>SPORT!FY</p>
                <button className="button" onClick={() => navigate("/home")}>Home</button>
                <button className="button" onClick={() => navigate("/find")}>Find</button>
                <button className="button">Friends</button>
                <button className="button" onClick={() => navigate("/profile")}>Profile</button>
                <button className="button" id="but3" onClick={() => navigate("/login")}>Sign Out</button>
            </nav>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by sport or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-button">Find</button>
            </div>

            <div className="teams-list">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                        <div key={team.id} className="team-card">
                            <h3>{team.name}</h3>
                            <p><i>{team.date} || Time: {team.time}</i></p>
                            <p>Location: {team.location}</p>
                            <button className="join-button">Join Team</button>
                        </div>
                    ))
                ) : (
                    <p className="no-results">No teams found.</p>
                )}
            </div>
        </div>
    );
}
