import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = () => {
      console.log('Handling Google callback...');
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const isNewUser = params.get('isNewUser') === 'true';
      
      console.log('Callback params:', { token: token ? 'present' : 'missing', isNewUser });
      
      if (token) {
        // Store the token
        localStorage.setItem('token', token);
        console.log('Token stored in localStorage');
        
        // Redirect based on isNewUser flag
        if (isNewUser) {
          console.log('New user, redirecting to profile');
          navigate('/profile');
        } else {
          console.log('Existing user, redirecting to home');
          navigate('/home');
        }
      } else {
        console.log('No token found, redirecting to login');
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [navigate, location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundImage: "url('/sports.jpg')",
      backgroundSize: "cover",
      backgroundPosition: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h2>Processing your login...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
} 