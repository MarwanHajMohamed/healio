import React from "react";
import Logo from "../css/assets/Healio Logo.png";
import "../css/navbar.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="navbar-container">
      <div className="left-side">
        <div className="logo-container">
          <img src={Logo} alt="" />
          <div className="healio-title">Healio</div>
        </div>
      </div>
      <div className="right-side">
        <button onClick={() => navigate("/register")}>Register</button>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
}
