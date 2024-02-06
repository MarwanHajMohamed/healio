import React from "react";
import Logo from "../css/assets/Healio Logo.png";
import "../css/navbar.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleButton = (loc) => {
    if (localStorage.getItem("token") === "") {
      navigate(loc);
    } else {
      navigate("/chat");
    }
  };

  return (
    <div className="navbar-container">
      <div className="left-side">
        <div className="logo-container">
          <img src={Logo} alt="" />
          <div className="healio-title">Healio</div>
        </div>
      </div>
      <div className="right-side">
        <button onClick={() => handleButton("/register")}>Register</button>
        <button onClick={() => handleButton("/login")}>Login</button>
      </div>
    </div>
  );
}
