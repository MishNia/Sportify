import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetails, joinEvent, leaveEvent } from '../api';
import ChatWindow from '../components/ChatWindow';
import './EventDetails.css';

// Sport emoji mapping
const sportEmojis = {
    'Badminton': '🏸',
    'Tennis': '🎾',
    'Basketball': '🏀',
    'Football': '⚽',
    'Cricket': '🏏',
    'Baseball': '⚾',
    'Volleyball': '🏐',
    'Table Tennis': '🏓',
    'Rugby': '🏉',
    'Golf': '⛳',
    'Swimming': '🏊',
    'Running': '🏃',
    'Cycling': '🚴',
    'Boxing': '🥊',
    'Wrestling': '🤼',
    'Soccer': '⚽',
    // Add more sports and their emojis as needed
};

export default function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isParticipant, setIsParticipant] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                if (!eventId) {
                    setError('Event ID is missing');
                    setLoading(false);
                    return;
                }

                const result = await getEventDetails(eventId);
                const eventData = result.data;
                setEvent(eventData);

                setIsParticipant(false);
                if (eventData.participants && Array.isArray(eventData.participants)) {
                    for (const participant of eventData.participants) {
                        if (participant.user_id === parseInt(localStorage.getItem("userId"))) {
                            setIsParticipant(true);
                            break;
                        }
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event details:', error);
                setError('Failed to load event details');
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleJoin = async () => {
        try {
            await joinEvent(eventId);
            setIsParticipant(true);
            // Refresh event details to update participant count
            const data = await getEventDetails(eventId);
            setEvent(data.data);
        } catch (error) {
            setError('Failed to join event');
        }
    };

    const handleLeave = async () => {
        try {
            await leaveEvent(eventId);
            setIsParticipant(false);
            // Refresh event details to update participant count
            const data = await getEventDetails(eventId);
            setEvent(data.data);
        } catch (error) {
            setError('Failed to leave event');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!event) return <div className="error">Event not found</div>;

    return (
        <div>
            <nav className="navbar">
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
                    <div style={{ height: '100%', width: '100%', flex: 3 }}>
                        <button className="button" onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}>Sign Out</button>
                    </div>
                </div>
            </nav>

            <div className="event-container">
                <div className="event-details">
                    {/* Event Header */}
                    <div className="event-header">
                        <div className="event-creator">
                            <div className="creator-avatar">
                                {event.owner_first_name ? event.owner_first_name[0] : '?'}
                            </div>
                            <span className="creator-name">{event.owner_first_name + " " + event.owner_last_name || 'Unknown'}</span>
                        </div>
                        <div className="participant-count">
                            {event.registered_count}/{event.max_players}
                        </div>
                    </div>

                    {/* Event Title */}
                    <div className="event-title">
                        <h1>{event.title}</h1>
                    </div>

                    {/* Event Description */}
                    <div className="event-description">
                        {event.description}
                    </div>

                    {/* Event Info */}
                    <div className="event-info">
                        <div className="info-row">
                            <span className="info-label">
                                <span className="info-icon">{sportEmojis[event.sport] || '🏃'}</span>
                                Sport
                            </span>
                            <span className="info-value">{event.sport}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">
                                <span className="info-icon">📍</span>
                                Location
                            </span>
                            <span className="info-value">{event.location_name}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">
                                <span className="info-icon">📅</span>
                                Date & Time
                            </span>
                            <span className="info-value">
                                {new Date(event.event_datetime).toLocaleString(undefined, {
                                    month: "2-digit",
                                    day: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Join/Leave Button */}
                    <div className="event-actions">
                        {isParticipant ? (
                            <button onClick={handleLeave} className="leave-button">
                                Leave
                            </button>
                        ) : (
                            <button onClick={handleJoin} className="join-button">
                                Join
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="chat-section">
                    <ChatWindow eventId={event.id} isParticipant={isParticipant} />
                </div>
            </div>
        </div>
    );
}