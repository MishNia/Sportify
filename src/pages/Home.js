import React from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"

export default function Home() {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
                    <div style={{ flex: 3, height: '100%', width: '100%' }}><button className="button" onClick={() => navigate("/Home")}>Home</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => navigate("/Find")}>Find</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button">Friends</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" onClick={() => navigate("/Profile")}>Profile</button></div>
                    <div style={{ height: '100%', width: '100%', flex: 3 }}><button className="button" id="but3" onClick={() => navigate("/login")}>Sign Out</button></div>
                </div>
            </nav>
            <div style={{
                flex: 1,
                display: "flex",
                backgroundImage: "url('/sports.jpg')", backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%", // Full screen height
                width: "100%"
            }}> <div style={{ flex: 2, backgroundColor: 'black', opacity: "80%", color: "white", height: '200px', margin: "50px" ,width: "1000px" }}>
                    <h1 style={{ fontSize: "20px", paddingTop: "20px", margin:"0px" }}>Come join us for a basketball game!</h1>
                    <p style={{margin:"0px" }}><i>12th Feb, 2025 || Time: 5:00 pm</i></p>
                    <p style={{margin:"0px" }}>Location: Recsports, Gainesville, FL</p>
                    <button id="but5" style={{ margin:"20px",padding: "5px 5px", fontSize: "15px" }} > Join Team </button>
                </div>
                <div style={{ flex: 2, backgroundColor: 'black', opacity: "80%", color: "white", height: '200px', margin: "50px" }}>
                    <h1 style={{ fontSize: "20px", paddingTop: "20px", margin:"0px" }}>Who's in for some beach tennis?</h1>
                    <p style={{margin:"0px" }}><i>15th Feb, 2025 || Time: 10:00 am</i></p>
                    <p style={{margin:"0px" }}>Location: paul beach, St. Augustine, FL</p>
                    <button id="but5" style={{ margin:"20px",padding: "5px 5px", fontSize: "15px" }} > Join Team </button>
                </div>
                <div style={{flex: 2, backgroundColor: 'black', opacity: "80%", color: "white", height: '200px', margin: "50px" }}>
                    <h1 style={{ fontSize: "20px", paddingTop: "20px", margin:"0px" }}>Soccer lovers, this is your time to shine!</h1>
                    <p style={{margin:"0px" }}><i>16th Feb, 2025 || Time: 8:00 pm</i></p>
                    <p style={{margin:"0px" }}>Location: Recsports, Gainesville, FL</p>
                    <button id="but5" style={{ margin:"20px",padding: "5px 5px", fontSize: "15px" }} > Join Team </button>
                </div>
                <div style={{flex: 2, backgroundColor: 'black', opacity: "80%", color: "white", height: '200px', margin: "50px" }}>
                    <h1 style={{ fontSize: "20px", paddingTop: "20px", margin:"0px" }}>Lets play Soccer!</h1>
                    <p style={{margin:"0px" }}><i>16th Feb, 2025 || Time: 10:00 pm</i></p>
                    <p style={{margin:"0px" }}>Location: deviant park, Jacksonville, FL</p>

                    <button id="but5" style={{ margin:"20px",padding: "5px 5px", fontSize: "15px" }} > Join Team </button>
                </div>
            </div>
        </div>
    );
}