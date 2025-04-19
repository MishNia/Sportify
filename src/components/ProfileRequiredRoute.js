import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileRequiredRoute = ({ children }) => {
  const { isAuthenticated, loading, userProfile, checkUserProfile } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated) {
        if (userProfile) {
          setHasProfile(true);
        } else {
          const profileExists = await checkUserProfile();
          setHasProfile(profileExists);
        }
      }
      setCheckingProfile(false);
    };

    checkProfile();
  }, [isAuthenticated, userProfile, checkUserProfile]);

  // Show loading state while checking authentication and profile
  if (loading || checkingProfile) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect to profile creation if authenticated but no profile
  if (!hasProfile) {
    return <Navigate to="/profile" />;
  }

  // Render children if authenticated and has profile
  return children;
};

export default ProfileRequiredRoute;
