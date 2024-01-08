import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/sidebar.css";
import Logo from "../css/assets/Healio Logo.png";

export default function Sidebar({ setMainChats }) {
  const [chats, setChats] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios.get(`http://localhost:8080/chats/${userId}`).then((response) => {
      setChats(response.data);
      console.log(response.data);
    });
  }, [userId]);

  let navigate = useNavigate();

  const signOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleNav = () => {
    setToggle(!toggle);
    setOpen(!open);
  };

  const handleChats = (chatId) => {
    setActive(chatId);
    chats.map((chat) => {
      return setMainChats([
        {
          prompt: chat.senderMessage,
          response: chat.recipientMessage,
        },
      ]);
    });
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
            <div className="new-chat">
              <div className="title">
                <img src={Logo} alt="" />
                <div className="heading">Healio</div>
              </div>
              <i class="fa-solid fa-message"></i>
            </div>
          </div>
        </div>
        <div className="sidebar-list">
          <div className="sidebar-item-list">
            {chats.map((chat) => {
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
            })}
          </div>
        </div>
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
