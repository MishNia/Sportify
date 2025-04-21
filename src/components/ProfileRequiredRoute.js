import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileRequiredRoute = ({ children }) => {
  console.log('ProfileRequiredRoute: Component rendering');
  const { isAuthenticated, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    console.log('ProfileRequiredRoute: useEffect running');
    // Simple check based on localStorage
    if (isAuthenticated) {
      const profileState = localStorage.getItem('hasProfile');
      console.log('ProfileRequiredRoute: hasProfile from localStorage:', profileState);

      // If we have a definitive 'false' value, user needs to create a profile
      if (profileState === 'false') {
        console.log('ProfileRequiredRoute: User definitely has no profile');
        setHasProfile(false);
      } else {
        // For any other value (including null, undefined, or 'true'), assume user has a profile
        // This prevents redirect loops and unnecessary API calls
        console.log('ProfileRequiredRoute: Assuming user has a profile');
        setHasProfile(true);

        // If we're not sure, set the flag to true to prevent redirect loops
        if (profileState !== 'true') {
          console.log('ProfileRequiredRoute: Setting hasProfile to true in localStorage');
          localStorage.setItem('hasProfile', 'true');
        }
      }
    }
    setCheckingProfile(false);
  }, [isAuthenticated]);

  // Show loading state while checking authentication and profile
  if (loading || checkingProfile) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProfileRequiredRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Redirect to profile creation if authenticated but no profile
  if (!hasProfile) {
    console.log('ProfileRequiredRoute: User has no profile, redirecting to profile creation');
    return <Navigate to="/profile" />;
  }

  // Render children if authenticated and has profile
  console.log('ProfileRequiredRoute: User is authenticated and has profile, rendering children');
  return children;
};

export default ProfileRequiredRoute;
