import React from "react";
import "../css/verifyEmail.css";
import Logo from "../css/assets/Healio Logo.png";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="verify-email-container">
      <div className="container">
        <div className="image-container">
          <img src={Logo} alt="" />
        </div>
        <div className="text">
          Registration successful. Please check your email to verify your
          account.
        </div>
        <div className="login" onClick={() => navigate("/login")}>
          Login
        </div>
      </div>
    </div>
  );
}
