import axios from "axios";

const API_BASE_URL = "http://localhost:8080/v1"; // Change this if backend URL changes

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
    };
};

// Helper function for authenticated requests
const authRequest = async (method, url, data = null) => {
    try {
        const headers = getAuthHeaders();
        const config = { headers };

        console.log(`Making ${method.toUpperCase()} request to: ${API_BASE_URL}${url}`);
        if (data) {
            console.log('Request data:', data);
        }

        let response;
        if (method === 'get') {
            response = await axios.get(`${API_BASE_URL}${url}`, config);
        } else if (method === 'post') {
            response = await axios.post(`${API_BASE_URL}${url}`, data, config);
        } else if (method === 'put') {
            response = await axios.put(`${API_BASE_URL}${url}`, data, config);
        } else if (method === 'delete') {
            response = await axios.delete(`${API_BASE_URL}${url}`, config);
        }

        console.log(`Response from ${method.toUpperCase()} ${url}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error in ${method.toUpperCase()} request to ${url}:`, error);

        // If token is invalid/expired, redirect to login
        if (error.response && error.response.status === 401) {
            console.log('Authentication error, redirecting to login');
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return {
            error: error.response?.data?.error || error.message || "Request failed",
            status: error.response?.status
        };
    }
};

// Signup API Call
export const signupUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/signup`,
            { email, password });
        return response.data;
    } catch (error) {
        return { error: error.response?.data?.error || "Something went wrong" };
    }
};

// Login API Call
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

        // Decode the JWT token to get user ID
        if (response.data && response.data.data) {
            const token = response.data.data;
            try {
                // JWT tokens are in format: header.payload.signature
                // We need the payload part which is the second part
                const payload = token.split('.')[1];
                // The payload is base64 encoded, so we need to decode it
                const decodedPayload = JSON.parse(atob(payload));
                // Store the user ID from the 'sub' claim
                if (decodedPayload.sub) {
                    localStorage.setItem('userId', decodedPayload.sub);
                }
            } catch (decodeError) {
                console.error('Error decoding JWT token:', decodeError);
            }
        }

        return response.data;
    } catch (error) {
        return { error: error.response?.data?.error || "Invalid credentials" };
    }
};

// Create Profile API Call
export const createProfile = async (profileData) => {
    return authRequest('post', '/profile', profileData);
};

// Get User Profile
export const getUserProfile = async () => {
    try {
        console.log('getUserProfile: Attempting to fetch user profile');
        const result = await authRequest('get', '/profile/0');

        // If we get a 404 (not found) error, it means the profile doesn't exist
        if (result.status === 404) {
            console.log('getUserProfile: Profile not found (404)');
            return { error: 'Profile not found', status: 404 };
        }

        // If there's any other error, log it but don't treat it as "no profile"
        if (result.error) {
            console.error('getUserProfile: Error fetching profile:', result.error);
            // Return a special flag to indicate this was a server error, not a missing profile
            return { error: result.error, status: result.status, isServerError: true };
        }

        console.log('getUserProfile: Profile fetched successfully');
        return result;
    } catch (error) {
        console.error('getUserProfile: Unexpected error:', error);
        return { error: error.message, isServerError: true };
    }
};

// Get User Profile by ID
export const getUserProfileById = async (userId) => {
    try {
        console.log(`getUserProfileById: Attempting to fetch profile for user ID ${userId}`);
        const result = await authRequest('get', `/profile/${userId}`);

        if (result.error) {
            console.error('getUserProfileById: Error fetching profile:', result.error);
            return { error: result.error };
        }

        console.log('getUserProfileById: Profile fetched successfully');
        return result;
    } catch (error) {
        console.error('getUserProfileById: Unexpected error:', error);
        return { error: error.message };
    }
};

// Update User Profile
export const updateProfile = async (profileData) => {
    return authRequest('put', '/profile', profileData);
};

// Create Event API Call
// export const createEvent = async (eventData) => {
//     console.log('createEvent called with data:', eventData);
//     try {
//         const result = await authRequest('post', '/events', eventData);
//         console.log('createEvent response:', result);
//         return result;
//     } catch (error) {
//         console.error('Error in createEvent:', error);
//         return { error: error.message || 'Failed to create event' };
//     }
// };

// Get All Events
// export const getAllEvents = async (filters = {}) => {
//     try {
//         console.log('Calling getAllEvents with filters:', filters);
//         console.log('API_BASE_URL:', API_BASE_URL);
//
//         // The backend expects a JSON body in the GET request
//         const headers = getAuthHeaders();
//         console.log('Auth headers:', headers);
//
//         // The backend expects snake_case field names
//         console.log('Making API request to:', `${API_BASE_URL}/events`);
//         console.log('With filters:', filters);
//
//         // Try using POST method which is more standard for sending a body
//         const response = await axios.post(`${API_BASE_URL}/events`, filters, { headers });
//
//         console.log('API response status:', response.status);
//         console.log('API response headers:', response.headers);
//         console.log('getAllEvents raw result:', response.data);
//
//         return response.data;
//     } catch (error) {
//         console.error('Error in getAllEvents:', error);
//         console.error('Error response:', error.response);
//         console.error('Error message:', error.message);
//
//         if (error.response) {
//             console.error('Status:', error.response.status);
//             console.error('Data:', error.response.data);
//             console.error('Headers:', error.response.headers);
//         }
//
//         return { error: error.response?.data?.error || error.message || 'Failed to fetch events' };
//     }
// };

export const createEvent = async (eventData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/v1/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create event');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

export const updateEvent = async (eventId, eventData) => {
    try {
        console.log('Updating event with ID:', eventId);
        console.log('Update payload:', eventData);

        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/v1/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        console.log('Update response status:', response.status);

        // Get the response text first to log it
        const responseText = await response.text();
        console.log('Update response text:', responseText);

        // Parse the response if it's JSON
        let responseData;
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
            throw new Error(responseData.message || responseData.error || 'Failed to update event');
        }

        return responseData;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

export const getEvents = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/v1/events/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch events');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const getEventDetails = async (eventId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/v1/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch event details');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching event details:', error);
        throw error;
    }
};

export const joinEvent = async (eventId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/v1/events/${eventId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to join event');
        }

        return await response.json();
    } catch (error) {
        console.error('Error joining event:', error);
        throw error;
    }
};

export const leaveEvent = async (eventId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/v1/events/${eventId}/leave`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to leave event');
        }

        return await response.json();
    } catch (error) {
        console.error('Error leaving event:', error);
        throw error;
    }
};

export const getUserJoinedEvents = async () => {
    try {
        // Get the current user ID
        const userId = parseInt(localStorage.getItem('userId'));
        if (!userId) {
            throw new Error('User ID not found');
        }

        // Fetch all events
        const eventsResponse = await getEvents();
        const allEvents = eventsResponse.data;

        // Filter events where the user is a participant
        const joinedEvents = [];

        // For each event, fetch details to get participants
        for (const event of allEvents) {
            const eventDetails = await getEventDetails(event.id);
            const eventData = eventDetails.data;

            // Check if the user is a participant
            if (eventData.participants &&
                eventData.participants.some(p => p.user_id === userId)) {
                joinedEvents.push(eventData);
            }
        }

        return { data: joinedEvents };
    } catch (error) {
        console.error('Error fetching joined events:', error);
        throw error;
    }
};

export const getUserCreatedEvents = async () => {
    try {
        // Get the current user ID
        const userId = parseInt(localStorage.getItem('userId'));
        if (!userId) {
            throw new Error('User ID not found');
        }

        // Fetch all events
        const eventsResponse = await getEvents();
        const allEvents = eventsResponse.data;

        // Filter events where the user is the owner
        const createdEvents = allEvents.filter(event => event.event_owner === userId);

        console.log('Created events:', createdEvents);
        return { data: createdEvents };
    } catch (error) {
        console.error('Error fetching created events:', error);
        throw error;
    }
};

export const deleteEvent = async (eventId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/v1/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete event');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};
