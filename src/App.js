import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import FindTeams from './pages/FindTeams'
import Main from './pages/Main'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Forgotpass from './pages/Forgotpass'
import Profile from './pages/Profile'
import GoogleCallback from './pages/GoogleCallback'
import CreateEvent from './pages/CreateEvent'
import MyProfile from "./pages/MyProfile";
import EventDetails from "./pages/EventDetails";
import './App.css';

// Auth Context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileRequiredRoute from './components/ProfileRequiredRoute';

function App() {
  // Check if token exists but hasProfile is not set
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const hasProfile = localStorage.getItem('hasProfile');

    console.log('App: Initial check - token:', !!token, 'hasProfile:', hasProfile);

    // If user is logged in but hasProfile is not set, default to true to prevent redirect loops
    if (token && !hasProfile) {
      console.log('App: Setting default hasProfile=true to prevent redirect loops');
      localStorage.setItem('hasProfile', 'true');
    }
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route index element={<Main />}/>
            <Route path="/Main" element={<Main />}/>
            <Route path="/Login" element={<Login />}/>
            <Route path="/Forgotpass" element={<Forgotpass />}/>
            <Route path="/Register" element={<Register />}/>
            <Route path="/auth/google/callback" element={<GoogleCallback />}/>
            <Route path="/events/:eventId" element={<EventDetails />}/>
            {/* Routes that only require authentication */}
            <Route path="/Profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }/>

            {/* Routes that require both authentication and a profile */}
            {/* Temporarily bypass ProfileRequiredRoute for Home to fix redirect issue */}
            <Route path="/Home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }/>
            <Route path="/find" element={
              <ProfileRequiredRoute>
                <FindTeams />
              </ProfileRequiredRoute>
            } />
            <Route path="/create-event" element={
              <ProfileRequiredRoute>
                <CreateEvent />
              </ProfileRequiredRoute>
            }/>
            <Route path="/MyProfile" element={
              <ProfileRequiredRoute>
                <MyProfile />
              </ProfileRequiredRoute>
            }/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
