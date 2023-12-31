import React, { useEffect, useRef, useState } from "react";
import "../css/main.css";
import axios from "axios";

export default function Main() {
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const textareaRef = useRef(null);

  const handlePrompts = (e) => {
    e.preventDefault();
    if (e.target.value === "") {
    } else {
      setText("");
      textareaRef.current.style.height = "33px";

      axios
        .post("/predict", { data: e.target.value })
        .then((response) => {
          console.log(JSON.parse(response.config.data)["data"]); // Handle the response
          // setResponses([...responses, response.data]);
          setChats([
            ...chats,
            {
              prompt: JSON.parse(response.config.data)["data"],
              response: response.data,
            },
          ]);
        })
        .catch((error) => {
          console.error(error.response.data);
        });
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
          {chats.map((chat) => {
            return chats.length > 0 ? (
              <div className="chat-container">
                <div className="prompt-container">
                  <div className="prompt-title">You</div>
                  <div className="prompt">{chat.prompt}</div>
                </div>
                <div className="prompt-container">
                  <div className="prompt-title">Healio</div>
                  <div className="prompt">
                    It is likely for you to have{" "}
                    <span style={{ fontWeight: "800" }}>{chat.response}</span>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="home-screen">
                Start by typing symptoms you are experiencing.
              </div>
            );
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
