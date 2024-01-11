import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/sidebar.css";
import Logo from "../css/assets/Healio Logo.png";

export default function Sidebar({
  setMainChats,
  setPromptDisabled,
  open,
  setOpen,
  setSelectedChat,
}) {
  const [chats, setChats] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios.get(`http://localhost:8080/chats/${userId}`).then((response) => {
      setChats(response.data);
      setIsLoading(false);
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

  const handleNewChat = async () => {
    setIsLoading(true);
    setSelectedChat("New Chat");

    // Store new conversation
    axios
      .post(`http://localhost:8080/conversations`, {
        title: "New Chat",
      })
      .then((response) => {
        console.log(response);
      });

    try {
      const lastChat = chats.find((chat) => chat.title === "New Chat");
      if (!lastChat) {
        await axios.post("http://localhost:8080/chats", {
          date: Date.now(),
          recipientMessage: "",
          senderMessage: "",
          title: "New Chat",
          userId: localStorage.getItem("userId"),
        });
        setIsLoading(false);
        setPromptDisabled(false);
        setMainChats([]);
      }
      await axios.get("http://localhost:8080/chats").then((response) => {
        setActive(response.data[response.data.length - 1].id);
        localStorage.setItem(
          "chatId",
          response.data[response.data.length - 1].id
        );
      });

      const response = await axios.get(`http://localhost:8080/chats/${userId}`);
      setChats(response.data);
    } catch (error) {
      console.error("Error creating or fetching chats", error);
    }
  };

  const handleChats = (chatId) => {
    const selectedChat = chats.find((chat) => chat.id === chatId);

    localStorage.setItem("chatId", chatId);

    setActive(chatId);

    if (selectedChat.title === "New Chat") {
      setPromptDisabled(false);
      setSelectedChat("New Chat");
      setMainChats([]);
    } else {
      setPromptDisabled(true);
      setMainChats([
        {
          prompt: selectedChat.senderMessage,
          response: selectedChat.recipientMessage,
        },
      ]);
    }
  };

  return (
    <div className="sidebar-container">
      <div className={open ? "side-open" : "side-collapse"}>
        <div className="chevron-container" onClick={toggleNav}>
          <i
            className={
              "fa-solid " + (toggle ? "fa-chevron-right" : "fa-chevron-left")
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
                      {chat.title[0].toUpperCase() + chat.title.slice(1)}
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
