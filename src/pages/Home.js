import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"
import { getEvents, joinEvent } from '../api'

export default function Home() {
    console.log('Home component: Mounting');
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Check if user has a profile only once when component mounts
    useEffect(() => {
        const checkProfileOnce = async () => {
            console.log('Home component: Performing one-time profile check');

            // Skip check if we've already done it in this session
            if (sessionStorage.getItem('profileCheckDone') === 'true') {
                console.log('Home component: Profile check already done in this session');
                setInitialCheckDone(true);
                return;
            }

            try {
                // Try to get the user profile
                const response = await fetch('http://localhost:8080/v1/profile/0', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 404) {
                    // User doesn't have a profile
                    console.log('Home component: User has no profile, redirecting to profile creation');
                    navigate('/profile');
                    return;
                }

                // If we get here, user has a profile or there was a different error
                // Either way, we'll allow them to stay on the home page
                console.log('Home component: User has a profile or there was a non-404 error');
                sessionStorage.setItem('profileCheckDone', 'true');
            } catch (error) {
                console.error('Home component: Error checking profile:', error);
                // On error, we'll still let them stay on the home page
            }

            setInitialCheckDone(true);
        };

        checkProfileOnce();
    }, [navigate]);

    useEffect(() => {
        // Only fetch events after the initial profile check is done
        if (!initialCheckDone) {
            console.log('Home component: Waiting for profile check before fetching events');
            return;
        }

        console.log('Home component: Profile check done, now fetching events');
        const fetchEvents = async () => {
            try {
                console.log('Home component: Fetching events...');
                const eventsResponse = await getEvents();
                const events = eventsResponse.data;
                console.log("Home component: Events received: ", events);
                setEvents(events);
            } catch (error) {
                console.error('Home component: Error fetching events:', error);
                setError('Failed to load events');
            }
        };

        fetchEvents();

        // Cleanup function to log when component unmounts
        return () => {
            console.log('Home component: Unmounting');
        };
    }, [initialCheckDone]); // Re-run when initialCheckDone changes

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

    // Show loading indicator while initial profile check is in progress
    if (!initialCheckDone) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundImage: "url('/sports.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}>
                <div style={{
                    padding: "20px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    borderRadius: "8px",
                    textAlign: "center"
                }}>
                    <h2>Loading...</h2>
                    <p>Checking your profile status</p>
                </div>
            </div>
        );
    }

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
                marginLeft: "30px",
                justifyContent:"flex-start",
                padding: "20px 40px",
                gap: "20px",
                alignItems: "flex-start",
                minHeight: "calc(100vh - 60px)" // Subtract nav height from viewport height
            }}>
                {/* Map through events array to display each event */}
                {events.map((event) => (
                    <div
                        key={event.id}
                        style={{
                            flex: "0 1 calc(35% - 60px)",
                            marginRight: "20px",
                            justifyContent: "space-between",
                            width: "800px",
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: "white",
                            height: "280px",
                            borderRadius: "8px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div style={{ margin: "0px"}}>
                            <div style={{ display: "flex", flexDirection: "row", backgroundColor:"black", borderRadius: "8px 8px 0 0", padding: "10px" }}>
                            <h1 style={{ fontSize: "20px", margin: "0 0 8px 0", flex: 1 }}>{event.title}</h1>
                            <p style={{ margin: "4px 0", fontSize: "14px", flex: 1 }}>Sport: {event.sport}</p>
                            </div>
                            <div style={{ padding: "10px" }}>
                            <p style={{ margin: "10px 0", fontSize: "14px" }}>{event.description}</p>
                            <div style={{ display: "flex", flexDirection: "row" }}>  
                             <p style={{ margin: "4px 0", fontSize: "14px", flex: 1 }}>📍 {event.location_name}</p>
                             <p style={{ margin: "4px 0", fontSize: "14px", flex: 1 }}>🗓 {new Date(event.event_date).toLocaleString()}</p>
                            </div>
                            <p style={{ paddingTop: "10px 0", fontSize: "14px" }}>Max Players: {event.max_players}</p> 
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "8px",
                            margin: "0px 10px 20px 10px"
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