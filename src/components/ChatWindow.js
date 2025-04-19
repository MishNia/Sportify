import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';

export default function ChatWindow({ eventId, isParticipant }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isParticipant) return;

        const ws = new WebSocket(`ws://localhost:8080/v1/events/${eventId}/chat`);
        
        ws.onopen = () => {
            console.log('WebSocket Connected');
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages(prev => [...prev, message]);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setSocket(null);
        };

        return () => {
            if (ws) ws.close();
        };
    }, [eventId, isParticipant]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const message = {
            content: newMessage,
            timestamp: new Date().toISOString()
        };

        socket.send(JSON.stringify(message));
        setNewMessage('');
    };

    if (!isParticipant) {
        return (
            <div className="chat-window">
                <div className="chat-header">
                    <h3>Event Chat</h3>
                </div>
                <div className="chat-messages">
                    <p>Join the event to access the chat</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>Event Chat</h3>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <span className="username">{msg.username}: </span>
                        <span className="content">{msg.content}</span>
                        <span className="timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" disabled={!socket}>
                    Send
                </button>
            </form>
        </div>
    );
} 