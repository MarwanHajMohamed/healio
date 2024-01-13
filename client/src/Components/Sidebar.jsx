import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/sidebar.css";
import Logo from "../css/assets/Healio Logo.png";

export default function Sidebar({
  chats,
  setChats,
  setPromptDisabled,
  open,
  setOpen,
  setSelectedChat,
}) {
  const [conversations, setConversations] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // setChats(response.data);
    axios
      .get(`http://localhost:8080/conversations/user/${userId}`)
      .then((res) => {
        if (res.data.length === []) {
          return;
        }
        setConversations(res.data);
        console.log(conversations);
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

    try {
      const lastChat = conversations.find((chat) => chat.title === "New Chat");
      if (!lastChat) {
        // Store new conversation
        await axios
          .post(`http://localhost:8080/conversations`, {
            title: "New Chat",
            userId: userId,
          })
          .then((response) => {
            localStorage.setItem(
              "conversationId",
              response.data.conversationId
            );
            console.log(localStorage.getItem("conversationId"));
          });
        // await axios.post("http://localhost:8080/chats", {
        //   date: Date.now(),
        //   recipientMessage: "",
        //   senderMessage: "",
        //   title: "New Chat",
        //   userId: localStorage.getItem("userId"),
        // });
        setIsLoading(false);
        setPromptDisabled(false);
        setChats([]);
      }
      // await axios.get("http://localhost:8080/chats").then((response) => {
      //   setActive(response.data[response.data.length - 1].id);
      //   localStorage.setItem(
      //     "chatId",
      //     response.data[response.data.length - 1].id
      //   );
      // });
      // setChats(response.data);
      axios
        .get(`http://localhost:8080/conversations/user/${userId}`)
        .then((res) => {
          if (res.data.length === 0) {
            setChats(res.data);
            setIsLoading(false);
          }
        });

      setConversations(response.data);

      const response = await axios.get(`http://localhost:8080/chats/${userId}`);
      setConversations(response.data);
    } catch (error) {
      console.error("Error creating or fetching chats", error);
    }
  };

  const handleConversations = (id) => {
    const selectedChat = conversations.find(
      (conversation) => conversation.conversationId === id
    );

    localStorage.setItem("conversationId", id);

    setActive(id);

    if (selectedChat.title === "New Chat") {
      setPromptDisabled(false);
      setSelectedChat("New Chat");
      setChats([]);
    } else {
      setPromptDisabled(true);
      axios
        .get(
          `http://localhost:8080/chats/conversation/${selectedChat.conversationId}`
        )
        .then((response) => {
          const newChats = response.data.map((chat) => ({
            prompt: chat.senderMessage,
            response: chat.recipientMessage,
          }));
          setChats(newChats);
        })
        .catch((error) => {
          console.log(error);
        });
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
              {conversations
                .map((conversation) => {
                  return (
                    <li
                      key={conversation.conversationId}
                      className={
                        active === conversation.conversationId
                          ? "side-item active"
                          : "side-item"
                      }
                      onClick={() =>
                        handleConversations(conversation.conversationId)
                      }
                    >
                      {conversation.title}
                    </li>
                  );
                })
                .sort((a, b) => b.key - a.key)}
            </div>
          </div>
        ) : (
          <div className="sidebar-list">
            <div className="sidebar-item-list">
              {conversations
                .map((conversation) => {
                  return (
                    <li
                      key={conversation.conversationId}
                      className={
                        active === conversation.conversationId
                          ? "side-item active"
                          : "side-item"
                      }
                      onClick={() =>
                        handleConversations(conversation.conversationId)
                      }
                    >
                      {conversation.title[0].toUpperCase() +
                        conversation.title.slice(1)}
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
