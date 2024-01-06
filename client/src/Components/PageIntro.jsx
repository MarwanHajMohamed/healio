import React from "react";
import Navbar from "./Navbar";
import "../css/pageintro.css";

export default function PageIntro() {
  return (
    <>
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
          <div className="right-side"></div>
        </div>
      </div>
    </>
  );
}
