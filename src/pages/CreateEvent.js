import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { createEvent } from '../api';

/**
 * CreateEvent Component
 * Renders a form for creating new sports events.
 * Handles form submission, location search, and validation.
 */
const CreateEvent = () => {
    const navigate = useNavigate();
    const autoCompleteRef = useRef(null);

    // Initialize form data state with empty values
    const [formData, setFormData] = useState({
        sport: "",
        event_date: "",
        max_players: "",
        location_name: "",
        latitude: "",
        longitude: "",
        description: "",
        title: ""
    });

    // States for managing UI interactions and feedback
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load Google Maps JavaScript API
        const googleMapScript = document.createElement('script');
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDmyMg9zTEshR4IYiUCBN9_OeazNbfvtf8&libraries=places`;
        googleMapScript.async = true;

        // Initialize Autocomplete after script loads
        googleMapScript.addEventListener('load', () => {
            // Check if the input element exists
            const input = document.getElementById('location-input');
            if (!input) return;

            // Initialize Autocomplete
            autoCompleteRef.current = new window.google.maps.places.Autocomplete(input, {
                types: ['establishment', 'geocode'],
                componentRestrictions: { country: 'US' }
            });

            // Add place_changed event listener
            autoCompleteRef.current.addListener('place_changed', () => {
                const place = autoCompleteRef.current.getPlace();
                if (place.geometry) {
                    setFormData(prev => ({
                        ...prev,
                        location_name: place.formatted_address,
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng()
                    }));
                }
            });
        });

        // Append script to document
        document.head.appendChild(googleMapScript);

        // Cleanup
        return () => {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src.includes('maps.googleapis.com')) {
                    script.remove();
                }
            }
        };
    }, []); // Empty dependency array means this effect runs once on mount

    /**
     * Handles changes in form input fields
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "max_players" ? Number(value) : value
        }));
    };

    /**
     * Handles form submission
     * Currently using localStorage for demonstration
     * Will be replaced with API call to backend
     * @param {Event} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate location data
        if (!formData.latitude || !formData.longitude) {
            setError("Please select a location from the dropdown suggestions");
            return;
        }

        setLoading(true);

        try {
            // Create event using the API
            const newEvent = await createEvent({
                ...formData,
                event_date: new Date(formData.event_date).toISOString()
            });

            alert("Event created successfully!");
            navigate("/home");
        } catch (err) {
            setError(err.message || "Failed to create event");
            console.error('Error creating event:', err);
        } finally {
            setLoading(false);
        }
    };

    // Component UI rendering
    return (
        // Main container with full viewport height and background
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed" // This ensures the background stays fixed while scrolling
        }}>
            {/* Navigation Bar */}
            <nav style={{
                background: 'black',
                height: '60px',
                display: 'flex',
                padding: '0px',
                flexDirection: 'row'
            }} className="navbar">
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
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}>Sign Out</button></div>
                </div>
            </nav>

            {/* Main content */}
            <div style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px"
            }}>
            {/* Form container box */}
            <div style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "50px",
                width: "500px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
            }}>
                {/* Form title */}
                <h2 style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    fontSize: "24px",
                    color: "#333"
                }}>Create Event</h2>

                {/* Error message display */}
                {error && <p style={{ color: "red", fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>{error}</p>}

                {/* Event creation form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {/* Form fields - each wrapped in a div for proper spacing */}
                    {/* Event Title field */}
                    <div>
                        <label htmlFor="title" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Event Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter event title"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                    </div>

                    {/* Description field */}
                    <div>
                        <label htmlFor="description" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Enter event description"
                            rows="4"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd",
                                resize: "vertical"
                            }}
                        />
                    </div>

                    {/* Sport selection dropdown */}
                    <div>
                        <label htmlFor="sport" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Sport
                        </label>
                        <select
                            id="sport"
                            name="sport"
                            value={formData.sport}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        >
                            <option value="">Select a sport</option>
                            <option value="Football">Football</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Tennis">Tennis</option>
                            <option value="Cricket">Cricket</option>
                            <option value="Soccer">Soccer</option>
                            <option value="Baseball">Baseball</option>
                        </select>
                    </div>

                    {/* Maximum Players field */}
                    <div>
                        <label htmlFor="max_players" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Maximum Players
                        </label>
                        <input
                            id="max_players"
                            type="number"
                            name="max_players"
                            value={formData.max_players}
                            onChange={handleChange}
                            required
                            placeholder="Enter max players"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                    </div>

                    {/* Location field with suggestions dropdown */}
                    <div style={{ position: "relative" }}>
                        <label htmlFor="location-input" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Location
                        </label>
                        <input
                            id="location-input"
                            type="text"
                            name="location_name"
                            value={formData.location_name}
                            onChange={handleChange}
                            required
                            placeholder="Search for a location"
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                    </div>

                    {/* Date and Time field */}
                    <div>
                        <label htmlFor="event_date" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Date and Time
                        </label>
                        <input
                            id="event_date"
                            type="datetime-local"
                            name="event_date"
                            value={formData.event_date}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "5px",
                                border: "1px solid #ddd"
                            }}
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        style={{
                            backgroundColor: loading ? "#ccc" : "black",
                            color: "white",
                            padding: "12px",
                            borderRadius: "5px",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: "20px",
                            fontSize: "16px",
                            fontWeight: "500"
                        }}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Event"}
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
}

export default CreateEvent;