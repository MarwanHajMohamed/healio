import React, { useEffect } from "react";
import Navbar from "./Navbar";
import "../css/pageintro.css";
import Diagnosis from "../css/assets/tutorial/Diagnosis.mp4";
import NewChat from "../css/assets/tutorial/New Chat.mp4";
import TypingSymptoms from "../css/assets/tutorial/Typing Symptoms.mp4";

export default function PageIntro() {
  useEffect(() => {
    if (localStorage.length === 0 || localStorage.getItem("token") === "") {
      localStorage.setItem("token", "");
    }
  });

  return (
    <div className="pageintro-wrapper">
      <Navbar />
      <div className="pageintro-container">
        <div className="left-side">
          <div className="title">
            Welcome your new AI healthcare assistant, Healio!
          </div>
          <div className="description">
            Healio is an AI healthcare chatbot which was trained on extensive
            medical data, empowering it to predict potential diseases based on
            the symptoms you provide.
          </div>
        </div>
        <div className="right-side">
          <div className="tutorial-container">
            <div className="section">
              <div>1. Create a new chat</div>
              <video src={NewChat} autoPlay loop muted />
            </div>
            <div className="section">
              <div>2. Type your symptoms</div>
              <video src={TypingSymptoms} autoPlay loop muted />
            </div>
            <div className="section">
              <div>3. Receive diagnosis from Healio</div>
              <video src={Diagnosis} autoPlay loop muted />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
