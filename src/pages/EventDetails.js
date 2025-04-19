import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetails, joinEvent, leaveEvent } from '../api';
import './EventDetails.css';

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
                console.log('result:', result);
                const eventData = result.data;
                console.log('Event data from API:', eventData);
                setEvent(eventData);


                setIsParticipant(false);
                for (const participant of eventData.participants) {
                    if (participant.id === localStorage.getItem("userId")) {
                        setIsParticipant(true);
                    }
                }
                setLoading(false);
            } catch (error) {
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
            setEvent(data.event);
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
            setEvent(data.event);
        } catch (error) {
            setError('Failed to leave event');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!event) return <div className="error">Event not found</div>;

    return (
        <div className="event-details">
            <h1>{event.title}</h1>
            <div className="event-info">
                <p><strong>Date:</strong> {new Date(event.event_datetime).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(event.eventDate).toLocaleTimeString()}</p>
                <p><strong>Location:</strong> {event.locationName}</p>
                <p><strong>Maximum Players:</strong> {event.maxPlayers}</p>
                <p><strong>Current Participants:</strong> {event.participantCount || 0}</p>
                <p><strong>Coordinates:</strong> {event.latitude}, {event.longitude}</p>
            </div>

            <div className="event-actions">
                {isParticipant ? (
                    <button onClick={handleLeave} className="leave-button">
                        Leave Event
                    </button>
                ) : (
                    <button onClick={handleJoin} className="join-button">
                        Join Event
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
}