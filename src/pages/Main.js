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
          <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" id="but3" onClick={() => navigate("/login")}>Log In</button></div>
          <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" id="but4" onClick={() => navigate("/Register")}>Get Started</button></div>
        </div>
      </nav>

      {/* This is the rest of the body */}
      <div style={{
        flex: 1,
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/sports.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100%",
        width: "100%",
      }}>
        <div className="hero-text" style={{
          
          color: "white",
          height: '400px',
          width: "1000px",
          backgroundPosition: "center",

          justifyContent: "center",
          textAlign: "center",
          margin: "100px auto"
        }}>
          <h3 style={{ fontSize: "50px" }}>Find Your Team, Live Your Dream! on <i>Sportify</i>.</h3>
          <p style={{ fontSize: "20px", margin: "20px auto", maxWidth: "700px", padding: "0 20px" }}>Find people who share your love for sports, join local events, and never miss a game again...</p>
          <p style={{ fontSize: "20px", paddingBottom: "20px" }}>Your Team is Waiting – Join Now!</p>
          <button id="but5" style={{ padding: "20px 100px", fontSize: "20px", cursor: "pointer", borderRadius: "10px" }} onClick={() => navigate("/Register")}>GET STARTED</button>
        </div>

        {/* Now put contact section here */}
        <div id="contact" className="support-section">
          <h2>Contact</h2>
          <div className="divider"></div>
          <p className="support-subtext">For more information, feel free to contact us</p>

          <div className="support-content">

            {/* RIGHT: Contact Info */}
            <div className="contact-inline">
              <div className="contact-links">
                <div className="info-inline">
                  <span className="icon">📧</span>
                  <a href="mailto:sonikagoud20@gmail.com">contact@sportify.com</a>
                </div>

                <div className="info-inline">
                  <span className="icon">🌐</span>
                  <a href="/Main" target="_blank" rel="noopener noreferrer">www.sportify.com</a>
                </div>

                <div className="info-inline">
                  <span className="icon">👨‍💻</span>
                  <a href="https://github.com/MishNia/sportify" target="_blank" rel="noopener noreferrer">github.com/MishNia/sportify</a>
                </div>
              </div>
              
            </div>
            <div className="footer">
              <p style={{ marginTop: "30px", fontSize: "14px" }}>© 2024 SPORT!FY. All rights reserved.</p>
              <a href="https://www.eng.ufl.edu/" style={{ color: "#ccc", fontSize: "14px" }}>University of Florida’s College of Engineering website</a>
              </div>
          </div>
        </div>
      </div>



    </div>
  );

}

