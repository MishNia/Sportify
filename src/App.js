import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import FindTeams from './pages/FindTeams'
import Main from './pages/Main'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Forgotpass from './pages/Forgotpass'
import Profile from './pages/Profile'
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Main />}/>
          <Route path="/Main" element={<Main />}/>
          <Route path="/Home" element={<Home />}/>
          <Route path="/find" element={<FindTeams />} />
          <Route path="/Profile" element={<Profile />}/>
          <Route path="/Login" element={<Login />}/>
          <Route path="/Forgotpass" element={<Forgotpass />}/>
          <Route path="/Register" element={<Register />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
