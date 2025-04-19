import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ 
      background: 'black', 
      height: '60px', 
      display: 'flex', 
      padding: '0px', 
      flexDirection: 'row' 
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40%',
        backgroundColor: 'black',
      }}>
        <img style={{ width: "50px", paddingRight: "10px" }} src="/iconmain.png" alt={"sportify"} />
        <p style={{
          margin: '0',
          padding: '0',
          color: 'white',
          fontSize: '40px',
          fontFamily: 'initial'
        }}>
          SPORT!FY
        </p>
      </div>
      <div style={{ 
        flex: 2, 
        display: 'flex', 
        height: '100%', 
        width: '100%', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'row' 
      }}>
        {isAuthenticated ? (
          <>
            <div style={{ flex: 3, height: '100%', width: '100%' }}>
              <Link to="/Home" className="button">Home</Link>
            </div>
            <div style={{ height: '100%', width: '100%', flex: 3 }}>
              <Link to="/find" className="button">Find</Link>
            </div>
            <div style={{ height: '100%', width: '100%', flex: 3 }}>
              <button className="button">Friends</button>
            </div>
            <div style={{ height: '100%', width: '100%', flex: 3 }}>
              <Link to="/MyProfile" className="button">Profile</Link>
            </div>
            <div style={{ height: '100%', width: '100%', flex: 3 }}>
              <Link to="/create-event" className="button" style={{
                fontSize: '24px',
                fontWeight: 'bold',
                padding: '0 20px'
              }}>+</Link>
            </div>
            <div style={{ height: '100%', width: '100%', flex: 3 }}>
              <button className="button" id="but3" onClick={handleLogout}>Sign Out</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 3, height: '100%', width: '100%' }}>
              <Link to="/Main" className="button">Home</Link>
            </div>
            <div style={{ height: '100%', width: '100%', flex: 3 }}>
              <Link to="/Login" className="button">Login</Link>
            </div>
            <div style={{ height: '100%', width: '100%', flex: 3 }}>
              <Link to="/Register" className="button">Register</Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
