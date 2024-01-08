import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/sidebar.css";
import Logo from "../css/assets/Healio Logo.png";

export default function Sidebar({ setMainChats, setPromptDisabled }) {
  const [chats, setChats] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios.get(`http://localhost:8080/chats/${userId}`).then((response) => {
      setChats(response.data);
      setIsLoading(false);
    });
  }, [userId]);

  const newChat = () => {
    if (!chats.indexOf(chats.length).title === "New Chat") {
      axios.post("http://localhost:8080/chats", {
        date: Date.now(),
        recipientMessage: "",
        senderMessage: "",
        title: "New Chat",
        userId: localStorage.getItem("userId"),
      });
    }
  };

  let navigate = useNavigate();

  const signOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleNav = () => {
    setToggle(!toggle);
    setOpen(!open);
  };

  const handleNewChat = (chatId) => {
    newChat();
    if (active === chatId) {
      setChats([
        ...chats,
        {
          title: "New Chat",
        },
      ]);
    }

    setPromptDisabled(false);
    setActive(chatId);
    setMainChats("");
  };

  const handleChats = (chatId) => {
    console.log(chats);
    setActive(chatId);
    setPromptDisabled(true);

    const selectedChat = chats.find((chat) => chat.id === chatId);
    console.log(chats.find((chat) => chat.id === chatId));

    setMainChats([
      {
        prompt: selectedChat.senderMessage,
        response: selectedChat.recipientMessage,
      },
    ]);
  };

  return (
    <div className="sidebar-container">
      <div className={open ? "side-open" : "side-collapse"}>
        <div className="chevron-container" onClick={toggleNav}>
          <i
            className={
              "fa-solid " + (toggle ? "fa-chevron-left" : "fa-chevron-right")
            }
          ></i>
        </div>
        <div className="sidebar">
          <div className="heading-container">
            <div className="new-chat" onClick={handleNewChat}>
              <div className="title">
                <img src={Logo} alt="" />
                <div className="heading">Healio</div>
              </div>
              <i class="fa-solid fa-message"></i>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div style={{ textAlign: "center" }}>Loading chats...</div>
        ) : (
          <div className="sidebar-list">
            <div className="sidebar-item-list">
              {chats
                .map((chat) => {
                  return (
                    <li
                      key={chat.id}
                      className={
                        active === chat.id ? "side-item active" : "side-item"
                      }
                      onClick={() => handleChats(chat.id)}
                    >
                      {chat.title}
                    </li>
                  );
                })
                .sort((a, b) => b.key - a.key)}
            </div>
          </div>
        )}
        <div className="bottom-container">
          <div className="sign-out" onClick={signOut}>
            <div>Sign out</div>
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
