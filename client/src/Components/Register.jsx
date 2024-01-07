import React, { useState } from "react";
import Logo from "../css/assets/Healio Logo.png";
import doctor2 from "../css/assets/doctor2.png";
import "../css/register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("error");

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (firstname === "" || surname === "" || email === "" || password === "") {
      setError("Fill out all the fields to continue.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    axios
      .post("http://localhost:8080/register", {
        first_name: firstname,
        surname: surname,
        email: email,
        password: password,
        role: "USER",
      })
      .then((res) => {
        if (res.data.message === "verify email") {
          navigate("/verify_email");
          return;
        }
        console.log(res);
        navigate("/chat");
      })
      .catch((error) => {
        console.log(error);
        setError(error.response.data);
      });
  };

  return (
    <div className="register-page-container">
      <div className="left-side">
        <div className="logo-container" onClick={() => navigate("/")}>
          <img src={Logo} alt="" />
          <div className="title">Healio</div>
        </div>
        <form>
          <div className="top-fields">
            <div className="firstname-container">
              <div className="txt">First name</div>
              <input
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                type="text"
              />
            </div>
            <div className="surname-container">
              <div className="txt">Surname</div>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                type="text"
              />
            </div>
          </div>
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
            <div className="login" onClick={() => navigate("/login")}>
              Login
            </div>
          </div>
          <div className="button-container">
            <button type="submit" onClick={handleRegister}>
              Register
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
      <div className="right-side">
        <div className="image-container">
          <img src={doctor2} alt="" />
        </div>
        <div className="text-description">
          <div className="text">Your personal AI healthcare companion!</div>
        </div>
      </div>
    </div>
  );
}
