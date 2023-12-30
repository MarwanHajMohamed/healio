import React, { useState } from "react";
import "../css/main.css";

export default function Main() {
  const [prompts, setPrompts] = useState([]);
  const [responses, setResponses] = useState([]);

  const handlePrompts = (e) => {
    e.preventDefault();
    setPrompts([...prompts, e]);
  };

  return (
    <div className="main-container">
      <div className="header">Healio</div>
      <div className="response-container">
        <div className="prompts">
          {prompts.map((prompt) => {
            return <div className="prompt">{prompt}</div>;
          })}
        </div>
        <div className="responses">
          {responses.map((response) => {
            return <div className="responses">{response}</div>;
          })}
        </div>
      </div>
      <div className="prompt-container">
        <form className="prompt-bar">
          <input
            placeholder="How can I help?"
            type="text"
            onSubmit={(e) => handlePrompts(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
