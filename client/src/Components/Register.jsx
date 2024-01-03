import React from "react";
import Logo from "../css/assets/Healio Logo.png";
import "../css/register.css";

export default function Register() {
  return (
    <div className="register-page-container">
      <div className="left-side">
        <div className="logo-container">
          <img src={Logo} alt="" />
          <div className="title">Healio</div>
        </div>
        <form>
          <div className="top-fields">
            <div className="firstname-container">
              <div className="txt">First name</div>
              <input type="text" />
            </div>
            <div className="surname-container">
              <div className="txt">Surname</div>
              <input type="text" />
            </div>
          </div>
          <div className="email-container">
            <div className="txt">Email</div>
            <input type="text" />
          </div>
          <div className="pass-container">
            <div className="txt">Password</div>
            <input type="text" />
          </div>
        </form>
      </div>
      <div className="right-side"></div>
    </div>
  );
}
