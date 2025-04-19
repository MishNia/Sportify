import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { getAllEvents, joinEvent } from "../api"

export default function Home() {
    const navigate = useNavigate();
    // Add a test event directly in the initial state
    const [events, setEvents] = useState([
        {
            id: 999,
            title: 'Test Event (Initial State)',
            sport: 'Basketball',
            event_datetime: new Date().toISOString(),
            location_name: 'Test Location',
            max_players: 10,
            registered_count: 2,
            description: 'This is a test event added directly to initial state',
            is_full: false
        }
    ]);

    const { userProfile, logout } = useAuth();

    useEffect(() => {
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token ? 'exists' : 'not found');
        if (token) {
            console.log('Token value (first 10 chars):', token.substring(0, 10) + '...');
        }

        // Fetch events from API
        const fetchEvents = async () => {
            console.log('Fetching events...');
            try {
                // Call API with empty filter to get all events
                console.log('Before API call');
                const result = await getAllEvents({});
                console.log('After API call');
                console.log('Raw API response:', result);
                console.log('Response type:', typeof result);
                console.log('Is array?', Array.isArray(result));

                if (!result.error) {
                    // Check if result is an array
                    if (Array.isArray(result)) {
                        console.log('Setting events from array result:', result);
                        // Combine with our test event
                        setEvents(prevEvents => {
                            const combinedEvents = [...prevEvents, ...result];
                            console.log('Combined events (array):', combinedEvents);
                            return combinedEvents;
                        });
                    } else if (result && typeof result === 'object') {
                        console.log('Result keys:', Object.keys(result));
                        // Try to find events in the response
                        if (Array.isArray(result.data)) {
                            console.log('Found events in result.data:', result.data);
                            // Combine with our test event
                            setEvents(prevEvents => {
                                const combinedEvents = [...prevEvents, ...result.data];
                                console.log('Combined events (data):', combinedEvents);
                                return combinedEvents;
                            });
                        } else if (Array.isArray(result.events)) {
                            console.log('Found events in result.events:', result.events);
                            // Combine with our test event
                            setEvents(prevEvents => {
                                const combinedEvents = [...prevEvents, ...result.events];
                                console.log('Combined events (events):', combinedEvents);
                                return combinedEvents;
                            });
                        } else {
                            console.error('Could not find events array in response:', result);
                            // For testing, create a mock event
                            const mockEvents = [
                                {
                                    id: 1,
                                    title: 'Test Event',
                                    sport: 'Football',
                                    event_datetime: new Date().toISOString(),
                                    location_name: 'Test Location',
                                    max_players: 10,
                                    registered_count: 2,
                                    description: 'This is a test event',
                                    is_full: false
                                }
                            ];
                            console.log('Using mock events for testing:', mockEvents);
                            setEvents(mockEvents);
                            console.log('Events set in state (mock):', mockEvents);
                        }
                    } else {
                        console.error('Unexpected events data format:', result);
                        setEvents([]);
                    }
                } else {
                    console.error('Error fetching events:', result.error);
                    setEvents([]);
                }
            } catch (error) {
                console.error('Exception fetching events:', error);
                setEvents([]);
            }
        };

        fetchEvents();
    }, []); // Empty dependency array means this runs once on mount

    const handleJoinTeam = async (eventId) => {
        try {
            const result = await joinEvent(eventId);
            if (!result.error) {
                alert('Successfully joined the event!');
                // Refresh events list
                const updatedEvents = await getAllEvents({});
                if (!updatedEvents.error) {
                    if (Array.isArray(updatedEvents)) {
                        setEvents(updatedEvents);
                    }
                }
            } else {
                alert(`Failed to join: ${result.error}`);
            }
        } catch (error) {
            console.error('Error joining event:', error);
            alert('An error occurred while joining the event');
        }
    };

    const handleViewEvent = (eventId) => {
        // TODO: Implement view event functionality
        console.log('Viewing event:', eventId);
        // navigate(`/event/${eventId}`); // Future implementation
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed" // This ensures the background stays fixed while scrolling
        }}>
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
                display: "flex",
                flexWrap: "wrap",
                padding: "20px",
                gap: "20px",
                alignItems: "flex-start",
                minHeight: "calc(100vh - 60px)" // Subtract nav height from viewport height
            }}>
                {/* Log events before rendering */}
                {console.log('Events before rendering:', events)}
                {/* Display message if no events */}
                {events.length === 0 ? (
                    <div style={{
                        width: "100%",
                        textAlign: "center",
                        padding: "50px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        borderRadius: "8px"
                    }}>
                        <h2>No events found</h2>
                        <p>Create a new event or check back later!</p>
                        <button
                            onClick={() => navigate("/create-event")}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginTop: "20px",
                                fontSize: "16px"
                            }}
                        >
                            Create Event
                        </button>
                    </div>
                ) : (
                    /* Map through events array to display each event */
                    events.map((event) => {
                        console.log('Rendering event:', event);
                        return (
                    <div
                        key={event.id}
                        style={{
                            flex: "0 1 calc(25% - 20px)",
                            maxWidth: "300px",
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            color: "white",
                            height: "fit-content",
                            padding: "15px",
                            borderRadius: "8px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1 style={{ fontSize: "20px", margin: "0 0 8px 0" }}>{event.title}</h1>
                                {event.is_full && (
                                    <span style={{
                                        backgroundColor: 'red',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        FULL
                                    </span>
                                )}
                            </div>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}><i>
                                {(() => {
                                    try {
                                        // The field is event_datetime in the response
                                        const dateStr = event.event_datetime;
                                        return dateStr ? new Date(dateStr).toLocaleString() : 'Date not specified';
                                    } catch (e) {
                                        console.error('Error parsing date:', e);
                                        return 'Invalid date format';
                                    }
                                })()}
                            </i></p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Sport: {event.sport}</p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Location: {event.location_name}</p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Players: {event.registered_count || 0}/{event.max_players}</p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Description: {event.description}</p>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "12px"
                        }}>
                            <button
                                onClick={() => handleJoinTeam(event.id)}
                                disabled={event.is_full}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: event.is_full ? "#cccccc" : "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: event.is_full ? "not-allowed" : "pointer",
                                    flex: 1,
                                    fontSize: "13px"
                                }}
                            >
                                {event.is_full ? "Full" : "Join Team"}
                            </button>
                            <button
                                onClick={() => handleViewEvent(event.id)}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#2196F3",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    flex: 1,
                                    fontSize: "13px"
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                )}))
                }
            </div>
        </div>
    );
}