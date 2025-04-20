import React from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"

export default function Main() {
  const navigate = useNavigate(); // to navigate from page to page

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* navigation bar for the main page is here */}
      <nav style={{ background: 'black', height: '60px', display: 'flex', padding: '0px', flexDirection: 'row' }} className="navbar">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '40%', // Ensures full width
          backgroundColor: 'black', // Debugging
        }}>
          <img style={{ width: "50px", paddingRight: "10px" }} src="/iconmain.png" />
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
        <div style={{ flex: 2, display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }} className="flex">
          <div style={{ flex: 3, height: '100%', width: '100%' }}><button className="button" onClick={() => navigate("/Main")}>Home</button></div>
          <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => document.getElementById("contact").scrollIntoView({ behavior: "smooth" })}>Contact</button></div>
          <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" id="but3" onClick={() => navigate("/Login")}>Log In</button></div>
          <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" id="but4" onClick={() => navigate("/Register")}>Get Started</button></div>
        </div>
      </nav>

      {/* This is the rest of the body */}
      <div style={{
        flex: 1,
        backgroundImage: "url('/sports.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100%",
        width: "100%",
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: "white",
          height: '550px',
          textAlign: "center",
          margin: "100px"
        }}>
          <h1 style={{ fontSize: "60px", paddingTop: "30px" }}><i>SPORT!FY</i></h1>
          <p style={{ fontSize: "30px" }}>Find Your Team, Live Your Dream! on <i>Sportify</i>.</p>
          <p style={{ fontSize: "20px", padding: "20px 300px" }}>Find people who share your love for sports, join local events, and never miss a game again...</p>
          <p style={{ fontSize: "20px", paddingBottom: "20px" }}>Your Team is Waiting – Join Now!</p>
          <button id="but5" style={{ padding: "20px 100px", fontSize: "20px", cursor: "pointer" }} onClick={() => navigate("/Register")}>GET STARTED</button>
        </div>
      </div>

      {/* Now put contact section here */}
      <div id="contact" className="support-section">
        <h2>Contact</h2>
        <div className="divider"></div>
        <p className="support-subtext">For more information, feel free to contact us</p>

        <div className="support-content">
          {/* LEFT: Contact Form */}
          <form className="support-form">
            <input type="text" placeholder="Your Name..." required />
            <input type="email" placeholder="Your Email..." required />
            <textarea placeholder="Your Message..." rows="5" required></textarea>
            <button type="submit">SEND</button>
          </form>

          {/* RIGHT: Contact Info */}
          <div className="support-info">
            <div className="info-item">
              <div className="icon">📧</div>
              <a href="mailto:sonikagoud20@gmail.com">contact@sportify.com</a>
            </div>
            <div className="info-item">
              <div className="icon">🌐</div>
              <a href="/Main" target="_blank">www.sportify.com</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

}

