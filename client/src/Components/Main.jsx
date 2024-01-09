import React, { useRef, useState, useEffect } from "react";
import "../css/main.css";
import axios from "axios";
import Sidebar from "./Sidebar";
import jsPDF from "jspdf";

export default function Main() {
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const [promptDisabled, setPromptDisabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [file, setFile] = useState({});

  const textareaRef = useRef(null);
  const ref = useRef(HTMLDivElement);

  useEffect(() => {
    if (chats.length) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  // Handles storing chats to database and making prediction of disease
  const handlePrompts = (e) => {
    e.preventDefault();
    if (e.target.value === "") {
    } else {
      setText("");
      textareaRef.current.style.height = "33px";

      // Predict disease using model
      axios
        .post("http://127.0.0.1:5000/predict", { data: e.target.value })
        .then((response) => {
          setChats([
            ...chats,
            {
              prompt: JSON.parse(response.config.data)["data"],
              response: response.data,
            },
          ]);
          console.log(response);

          // Store in database
          axios
            .put(
              `http://localhost:8080/chats/${localStorage.getItem("chatId")}`,
              {
                date: Date.now(),
                recipientMessage: response.data,
                senderMessage: JSON.parse(response.config.data)["data"],
                title: response.data,
                userId: localStorage.getItem("userId"),
              }
            )
            .catch((error) => {
              console.error(error.response.data);
            });
        });
    }
  };

  // Handles enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePrompts(e);
    }
  };

  // Update text container and scroll to the bottom
  const handleChange = (e) => {
    setText(e.target.value);
    textareaRef.current.style.height = "inherit";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  // Format JSON chat to PDF
  const formatJsonForPdf = (jsonArray) => {
    let formattedText = "";
    jsonArray.forEach((obj, index) => {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          formattedText += `  ${key}: ${obj[key]}\n`;
        }
      }
    });
    return formattedText;
  };

  // Download PDF Method
  const downloadPdf = (file, name) => {
    const doc = new jsPDF();
    const formattedFile = formatJsonForPdf(file);
    doc.text(formattedFile, 10, 10);
    doc.save(name);
  };

  // Store chats in array and download PDF
  const handleExport = () => {
    const exportData = chats.map((chat) => ({
      You: chat.prompt,
      Healio: chat.response,
    }));
    setFile(exportData);

    downloadPdf(exportData, "Healio Diagnosis");
  };

  return (
    <>
      <Sidebar
        setMainChats={setChats}
        setPromptDisabled={setPromptDisabled}
        open={open}
        setOpen={setOpen}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />
      <div className="main-container">
        <div className="conversation-container">
          <div className="prompts">
            {chats.length === 0 ? (
              <div className={open ? "home-screen open" : "home-screen"}>
                <div className="description">
                  Create a new chat from the sidebar to start, or select an old
                  chat to view.
                </div>
              </div>
            ) : (
              chats.map((chat) => {
                return selectedChat === "New Chat" && chat.response === "" ? (
                  <div className={open ? "home-screen open" : "home-screen"}>
                    <div className="description">
                      Start by typing symptoms you are experiencing.
                    </div>
                  </div>
                ) : (
                  <div
                    className={open ? "chat-container open" : "chat-container"}
                    ref={ref}
                  >
                    <div className="prompt-container">
                      <div className="prompt-title">You</div>
                      <div className="prompt">{chat.prompt}</div>
                    </div>
                    <div className="prompt-container">
                      <div className="prompt-title healio">Healio</div>
                      <div className="prompt" id="prompt">
                        It is likely for you to have{" "}
                        <span style={{ fontWeight: "800" }}>
                          {chat.response}
                        </span>
                        .
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {chats.length === 0 ? (
          ""
        ) : (
          <div
            className={
              open ? "user-prompt-container open" : "user-prompt-container"
            }
          >
            <form
              className={promptDisabled ? "prompt-bar disabled" : "prompt-bar"}
              onSubmit={handlePrompts}
            >
              <textarea
                rows="1"
                placeholder="How can I help?"
                value={text}
                ref={textareaRef}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              ></textarea>
            </form>

            <div className="options-container">
              <i class="fa-solid fa-file-export" onClick={handleExport}></i>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
