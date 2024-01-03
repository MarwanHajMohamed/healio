import React, { useState } from "react";
import Logo from "../css/assets/Healio Logo.png";
import doctor2 from "../css/assets/doctor2.png";
import "../css/login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("error");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      setError("Fill out all the fields to continue.");
      return;
    }

    axios
      .get("http://localhost:8080/user")
      .then((res) => {
        let login = res.data.some(
          (user) => email === user.email && password == user.password
        );

        if (login) {
          console.log(res.data);
          navigate("/main");
        } else {
          setError("Incorrect email or password.");
        }
      })
      .catch((error) => {
        console.error("Email check error:", error);
        setError("An error occurred. Please try again.");
      });
  };

  return (
    <div className="login-page-container">
      <div className="left-side">
        <div className="image-container">
          <img src={doctor2} alt="" />
        </div>
        <div className="text-description">
          <div className="text">Your personal AI healthcare companion!</div>
        </div>
      </div>
      <div className="right-side">
        <div className="logo-container">
          <img src={Logo} alt="" />
          <div className="title">Healio</div>
        </div>
        <form>
          <div className="email-container">
            <div className="txt">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
            />
          </div>
          <div className="pass-container">
            <div className="txt">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>
          <div className="bottom-container">
            <div className="register" onClick={() => navigate("/register")}>
              Register
            </div>
            <div className="reset-pass">Reset password</div>
          </div>
          <div className="button-container">
            <button type="submit" onClick={handleLogin}>
              Login
            </button>
          </div>
          <div
            className={
              error === "error" ? "error-message" : "error-message show"
            }
          >
            {error}
          </div>
        </form>
      </div>
    </div>
  );
}
