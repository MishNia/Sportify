import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"
import { getEvents, joinEvent } from '../api'

export default function Home() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [joinedEvents, setJoinedEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsResponse = await getEvents();
                const events = eventsResponse.data;
                console.log("Events: ", events);
                setEvents(events);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to load events');
            }
        };

        fetchEvents();
    }, []);

    const handleJoinTeam = async (eventId) => {
        try {
            setLoading(true);
            const response = await joinEvent(eventId);

            if (response.error) {
                setError(response.error);
                alert(response.error);
            } else {
                // Add the event ID to the joined events list
                setJoinedEvents([...joinedEvents, eventId]);
                alert('Successfully joined the event!');

                // Refresh events to get updated data
                const eventsResponse = await getEvents();
                const updatedEvents = eventsResponse.data;
                setEvents(updatedEvents);
            }
        } catch (error) {
            console.error('Error joining event:', error);
            setError('Failed to join event. ' + (error.message || ''));
            alert('Failed to join event: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (eventId) => {
        // TODO: Implement view event functionality
        console.log('Viewing event:', eventId);
        navigate(`/events/${eventId}`);
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
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                padding: "20px",
                gap: "20px",
                alignItems: "flex-start",
                minHeight: "calc(100vh - 60px)" // Subtract nav height from viewport height
            }}>
                {/* Map through events array to display each event */}
                {events.map((event) => (
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
                            <h1 style={{ fontSize: "20px", margin: "0 0 8px 0" }}>{event.title}</h1>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}><i>{new Date(event.event_date).toLocaleString()}</i></p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Sport: {event.sport}</p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Location: {event.location_name}</p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Max Players: {event.max_players}</p>
                            <p style={{ margin: "4px 0", fontSize: "14px" }}>Description: {event.description}</p>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "12px"
                        }}>
                            <button
                                onClick={() => handleJoinTeam(event.id)}
                                disabled={loading || event.is_full || joinedEvents.includes(event.id) ||
                                         (event.participants && event.participants.some(p => p.user_id === parseInt(localStorage.getItem('userId'))))}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: event.is_full || joinedEvents.includes(event.id) ||
                                                   (event.participants && event.participants.some(p => p.user_id === parseInt(localStorage.getItem('userId'))))
                                                   ? "#cccccc" : "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: event.is_full || joinedEvents.includes(event.id) ||
                                           (event.participants && event.participants.some(p => p.user_id === parseInt(localStorage.getItem('userId'))))
                                           ? "not-allowed" : "pointer",
                                    flex: 1,
                                    fontSize: "13px"
                                }}
                            >
                                {event.is_full ? "Event Full" :
                                 joinedEvents.includes(event.id) ||
                                 (event.participants && event.participants.some(p => p.user_id === parseInt(localStorage.getItem('userId'))))
                                 ? "Already Joined" : "Join Team"}
                            </button>
                            <button
                                onClick={() => handleViewDetails(event.id)}
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
                ))}
            </div>
        </div>
    );
}