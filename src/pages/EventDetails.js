import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetails, joinEvent, leaveEvent } from '../api';
import ChatWindow from '../components/ChatWindow';
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
                if (eventData.participants && Array.isArray(eventData.participants)) {
                    console.log('inside if loop');
                    for (const participant of eventData.participants) {
                        console.log('participant:', participant.user_id);
                        if (participant.user_id === parseInt(localStorage.getItem("userId"))) {
                            setIsParticipant(true);
                            console.log('setting isParticipant to true:', isParticipant);
                            break; // Optional: Break the loop once a match is found to optimize performance
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

                <p>
                    <strong>Date   & Time:</strong>{" "}
                    {new Date(event.event_datetime).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true   // change to false for 24‑hour clock
                    })}
                </p>

                <p><strong>Location:</strong> {event.location_name}</p>
                <p><strong>Maximum Players:</strong> {event.max_players}</p>
                <p><strong>Current Participants:</strong> {event.registered_count || 0}</p>
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

            <ChatWindow eventId={event.id} isParticipant={isParticipant} />

            {error && <div className="error-message">{error}</div>}
        </div>
    );
}