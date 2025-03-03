import axios from "axios";

const API_BASE_URL = "http://localhost:8080/v1"; // Change this if backend URL changes

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
        return response.data;
    } catch (error) {
        return { error: error.response?.data?.error || "Invalid credentials" };
    }
};

// Create Profile API Call
export const createProfile = async (profileData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/profile`,
            profileData);
        return response.data;
    } catch (error) {
        return { error: error.response?.data?.error || "Profile creation failed" };
    }
};
