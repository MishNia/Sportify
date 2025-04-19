import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile } from '../api';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        setIsAuthenticated(true);

        // Try to get user profile
        try {
          const profileData = await getUserProfile();
          if (!profileData.error) {
            setUserProfile(profileData);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (token, userData = null) => {
    console.log('Login function called with token:', token ? 'exists' : 'missing');
    localStorage.setItem('token', token);
    setIsAuthenticated(true);

    if (userData) {
      console.log('Setting user data from login:', userData);
      setCurrentUser(userData);
      if (userData.profile) {
        console.log('Setting profile from login userData');
        setUserProfile(userData.profile);
      }
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserProfile(null);
    window.location.href = '/login';
  };

  // Update profile
  const updateUserProfile = (profile) => {
    console.log('Updating user profile:', profile);
    setUserProfile(profile);
  };

  // Check if user has a profile
  const checkUserProfile = async () => {
    try {
      console.log('Checking if user has a profile...');
      const profileData = await getUserProfile();

      if (!profileData.error) {
        console.log('Profile found:', profileData);
        setUserProfile(profileData);
        return true;
      } else {
        console.log('No profile found or error:', profileData.error);
        return false;
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  };

  // Check if token is expired or invalid
  const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    // You could add JWT expiration checking here if needed

    return true;
  };

  // Value object to be provided to consumers
  const value = {
    currentUser,
    userProfile,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUserProfile,
    checkTokenValidity,
    checkUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
