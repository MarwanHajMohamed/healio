import axios from "axios";
import React, { useCallback, useEffect } from "react";
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
  conversations,
  setConversations,
}) {
  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState(null);

  const userId = localStorage.getItem("userId");

  async function getConversations() {
    await axios
      .get(`http://localhost:8080/conversations/user/${userId}`)
      .then((res) => {
        if (res.data.length === []) {
          return;
        }
        setConversations(res.data);
      });
  }

  useEffect(() => {
    getConversations();
  }, []);

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
    setSelectedChat("New Chat");

    try {
      const lastChat = conversations.find((chat) => chat.title === "New Chat");
      if (!lastChat) {
        localStorage.setItem("conversationTitle", "New Chat");
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
            setConversations([...conversations, response.data]);
            setActive(response.data.conversationId);
          });
        setPromptDisabled(false);
        setChats([]);
      } else if (lastChat && chats.length !== 0) {
        getConversations();
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
            setConversations([...conversations, response.data]);
            setActive(response.data.conversationId);
          });
        getConversations();
        setPromptDisabled(false);
        setChats([]);
      }
    } catch (error) {
      console.error("Error creating or fetching chats", error);
    }
  };

  const handleConversations = (id) => {
    const selectedChat = conversations.find(
      (conversation) => conversation.conversationId === id
    );

    localStorage.setItem("conversationId", id);
    localStorage.setItem("conversationTitle", selectedChat.title);

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

  async function deleteConversation(conversationId) {
    await axios
      .delete(`http://localhost:8080/conversations/delete/${conversationId}`)
      .then(() => {
        // Filter out the deleted conversation
        const updatedConversations = conversations.filter(
          (conversation) => conversation.conversationId !== conversationId
        );
        setConversations(updatedConversations);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .delete(`http://localhost:8080/chats/delete/${conversationId}`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
      });

    getConversations();
    setChats([]);
    setPromptDisabled(false);
  }

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
        <div className="sidebar-list">
          <div className="sidebar-item-list">
            {conversations
              .map((conversation) => {
                return (
                  <div
                    key={conversation.conversationId}
                    onClick={() =>
                      handleConversations(conversation.conversationId)
                    }
                    className={
                      active === conversation.conversationId
                        ? "side-item active"
                        : "side-item"
                    }
                  >
                    <li>
                      {conversation.title[0].toUpperCase() +
                        conversation.title.slice(1)}
                    </li>
                    <i
                      onClick={() =>
                        deleteConversation(conversation.conversationId)
                      }
                      class={
                        active === conversation.conversationId
                          ? "fa-solid fa-trash"
                          : ""
                      }
                    ></i>
                  </div>
                );
              })
              .sort((a, b) => b.key - a.key)}
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
