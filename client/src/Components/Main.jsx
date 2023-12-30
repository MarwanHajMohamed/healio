import React, { useRef, useState } from "react";
import "../css/main.css";

export default function Main() {
  const [prompts, setPrompts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handlePrompts = (e) => {
    e.preventDefault();
    if (e.target.value === "") {
    } else {
      setPrompts([...prompts, e.target.value]);
      setText("");
      textareaRef.current.style.height = "33px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePrompts(e);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    textareaRef.current.style.height = "inherit";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  return (
    <div className="main-container">
      <div className="header">Healio</div>
      <div className="conversation-container">
        <div className="prompts">
          {prompts.map((prompt) => {
            return (
              <div className="prompt-container">
                <div className="prompt-title">You</div>
                <div className="prompt">{prompt}</div>
              </div>
            );
          })}
        </div>
        <div className="responses">
          {responses.map((response) => {
            return <div className="responses">{response}</div>;
          })}
        </div>
      </div>
      <div className="user-prompt-container">
        <form className="prompt-bar" onSubmit={handlePrompts}>
          <textarea
            rows="1"
            placeholder="How can I help?"
            value={text}
            ref={textareaRef}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          ></textarea>
        </form>
      </div>
    </div>
  );
}
