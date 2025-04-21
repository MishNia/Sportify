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
      console.log('AuthContext: Checking auth status on initial load');
      const token = localStorage.getItem('token');
      const cachedProfileState = localStorage.getItem('hasProfile');

      if (token) {
        console.log('AuthContext: Token found, user is authenticated');
        setIsAuthenticated(true);

        // Check if we have a cached profile state
        if (cachedProfileState === 'true') {
          console.log('AuthContext: Using cached profile state (true)');
          setUserProfile({ cached: true }); // Set a temporary profile object
        } else if (cachedProfileState === 'false') {
          console.log('AuthContext: Using cached profile state (false)');
          // We know the user doesn't have a profile
        } else {
          console.log('AuthContext: No cached profile state, checking via API');
          // Try to get user profile
          try {
            const profileData = await getUserProfile();
            if (!profileData.error) {
              console.log('AuthContext: Profile found via API');
              setUserProfile(profileData);
              localStorage.setItem('hasProfile', 'true');
            } else if (profileData.status === 404) {
              console.log('AuthContext: Profile not found via API (404)');
              localStorage.setItem('hasProfile', 'false');
            } else {
              console.log('AuthContext: Error fetching profile, but not 404:', profileData.error);
              // For other errors, we'll assume the profile exists to prevent redirect loops
              localStorage.setItem('hasProfile', 'true');
              setUserProfile({ cached: true }); // Set a temporary profile object
            }
          } catch (error) {
            console.error("AuthContext: Failed to fetch user profile:", error);
            // If there's an exception, assume profile exists to prevent redirect loops
            localStorage.setItem('hasProfile', 'true');
            setUserProfile({ cached: true }); // Set a temporary profile object
          }
        }
      } else {
        console.log('AuthContext: No token found, user is not authenticated');
        // Clear cached profile state if user is not authenticated
        localStorage.removeItem('hasProfile');
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
        localStorage.setItem('hasProfile', 'true');
      }
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hasProfile');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserProfile(null);
    window.location.href = '/login';
  };

  // Update profile
  const updateUserProfile = (profile) => {
    console.log('Updating user profile:', profile);
    setUserProfile(profile);
    localStorage.setItem('hasProfile', 'true');
  };

  // Check if user has a profile
  const checkUserProfile = async () => {
    try {
      console.log('AuthContext: Checking if user has a profile...');

      // First check if we have a cached profile state
      const cachedProfileState = localStorage.getItem('hasProfile');
      if (cachedProfileState === 'true') {
        console.log('AuthContext: Using cached profile state (true)');
        return true;
      } else if (cachedProfileState === 'false') {
        console.log('AuthContext: Using cached profile state (false)');
        return false;
      }

      // If no cached state, check via API
      console.log('AuthContext: No cached profile state, checking via API');
      const profileData = await getUserProfile();

      if (!profileData.error) {
        console.log('AuthContext: Profile found:', profileData);
        setUserProfile(profileData);
        localStorage.setItem('hasProfile', 'true');
        return true;
      } else {
        console.log('AuthContext: Profile response has error:', profileData.error);

        // If it's a server error (not a 404 "profile not found"), we'll assume the profile exists
        // to prevent constant redirects on API errors
        if (profileData.isServerError) {
          console.log('AuthContext: This is a server error, not a missing profile. Assuming profile exists to prevent redirect loop.');
          localStorage.setItem('hasProfile', 'true');
          return true;
        }

        // Only return false (triggering redirect to profile creation) if we're sure the profile doesn't exist
        if (profileData.status === 404) {
          console.log('AuthContext: Profile definitely does not exist (404). Redirecting to profile creation.');
          localStorage.setItem('hasProfile', 'false');
          return false;
        }

        // For any other error, assume profile exists to prevent redirect loops
        console.log('AuthContext: Unknown error type. Assuming profile exists to prevent redirect loop.');
        localStorage.setItem('hasProfile', 'true');
        return true;
      }
    } catch (error) {
      console.error('AuthContext: Error checking profile:', error);
      // If there's an exception, assume profile exists to prevent redirect loops
      localStorage.setItem('hasProfile', 'true');
      return true;
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
