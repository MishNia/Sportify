import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"
import { getEvents, joinEvent } from '../api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faUsers, faRunning } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

export default function Home() {
    console.log('Home component: Mounting');
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
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
                setLoading(false);
            } catch (error) {
                console.error('Home component: Error fetching events:', error);
                setError('Failed to load events');
                setLoading(false);
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

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSportEmoji = (sport) => {
        const sportEmojis = {
            'Football': '⚽',
            'Basketball': '🏀',
            'Tennis': '🎾',
            'Volleyball': '🏐',
            'Baseball': '⚾',
            'Badminton': '🏸',
            'Table Tennis': '🏓',
            'Cricket': '🏏',
            'Rugby': '🏉',
            'Hockey': '🏑'
        };
        return sportEmojis[sport] || '⚽';
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

    if (loading) {
        return <div className="loading">Loading events...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url('/sports.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
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
            <div className="event-grid">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="event-card"
                    >
                        <div className="event-card-header">
                            <div className="event-creator">
                                <div className="creator-avatar-home">
                                    {event.owner_first_name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="creator-name-home">{event.owner_first_name + " " + event.owner_last_name}</span>
                            </div>
                            <div className="participant-count">
                                👥 {event.participants?.length || 0}/{event.max_players}
                            </div>
                        </div>
                        <div className="event-content">
                            <h3 className="event-title">{event.title}</h3>
                            <div className="event-info">
                                <div className="info-row">
                                    <div className="info-icon">
                                        {getSportEmoji(event.sport)}
                                    </div>
                                    {event.sport}
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">📍</div>
                                    {event.location_name}
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">🗓</div>
                                    {formatDate(event.event_datetime)}
                                </div>
                            </div>
                        </div>
                        <div className="event-actions">
                            <button
                                className="action-button join-button"
                                onClick={() => handleJoinTeam(event.id)}
                                disabled={loading || 
                                    event.participants?.length >= event.max_players || 
                                    joinedEvents.includes(event.id) ||
                                    (event.participants && event.participants.some(p => 
                                        p.user_id === parseInt(localStorage.getItem('userId'))))}
                            >
                                {event.participants?.length >= event.max_players ? "Event Full" :
                                    joinedEvents.includes(event.id) ||
                                    (event.participants && event.participants.some(p => 
                                        p.user_id === parseInt(localStorage.getItem('userId'))))
                                        ? "Already Joined" : "Join Team"}
                            </button>
                            <button
                                className="action-button view-button"
                                onClick={() => handleViewDetails(event.id)}
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