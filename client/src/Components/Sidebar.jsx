import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/sidebar.css";
import Logo from "../css/assets/Healio Logo.png";

// Mui
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

import StarRating from "./StarRating";

import { fetchGPs, fetchPharmacies } from "../functions/chatUtils";

// Google Maps
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

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
  const [openModalPharmacy, setOpenModalPharmacy] = useState(false);
  const [openModalGP, setOpenModalGP] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [pharmacies, setPharmacies] = useState([]);
  const [GPs, setGPs] = useState([]);
  const [pharmacyDetails, setPharmacyDetails] = useState([]);
  const [GPDetails, setGPDetails] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const resetMap = () => {
    setPharmacies([]);
    setPharmacyDetails([]);
    setGPs([]);
    setGPDetails([]);
  };

  const closeModal = (setOpenModal) => {
    setOpenModal(false);
    resetMap();
    setSelectedMarker(null);
  };

  const handleOpenPharmacy = () => setOpenModalPharmacy(true);
  const handleClosePharmacy = () => closeModal(setOpenModalPharmacy);

  const handleOpenGP = () => setOpenModalGP(true);
  const handleCloseGP = () => closeModal(setOpenModalGP);

  const userId = localStorage.getItem("userId");
  const mapKey = process.env.REACT_APP_MAPS_API;

  // eslint-disable-next-line
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: mapKey,
  });

  const onMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  async function getConversations() {
    await axios
      .get(`http://localhost:8080/conversations/user/${userId}`)
      .then((res) => {
        if (res.data.length === []) {
          return;
        }
        console.log(res.data);
        setConversations(res.data);
      });
  }

  useEffect(() => {
    getConversations();
    // eslint-disable-next-line
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
          console.log(response.data);
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

  const updateLocation = async (fetchService, setService) => {
    setMapLoading(true);

    const getCurrentPosition = (options = {}) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      const position = await getCurrentPosition();
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(newLocation); // Update location

      const serviceData = await fetchService(newLocation);

      setService(serviceData); // Update the service state with the fetched data
    } catch (error) {
      console.error("Error in updateLocation:", error);
      // Handle location fetching error
    } finally {
      setMapLoading(false); // Ensure loading state is turned off
    }
  };

  const showPharmacies = () => {
    resetMap();
    updateLocation(fetchPharmacies, setPharmacies);
    handleOpenPharmacy();
  };

  const showGPs = () => {
    resetMap();
    updateLocation(fetchGPs, setGPs);
    handleOpenGP();
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 520,
    bgcolor: "black",
    boxShadow: 24,
    outline: "none",
    p: 4,
    borderRadius: 10,
  };

  return (
    <>
      <Modal
        open={openModalPharmacy}
        onClose={handleClosePharmacy}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <div className="modal-title">Pharmacies</div>
            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "400px",
                marginTop: 20,
                borderRadius: 15,
                boxShadow: "0 5px 5px rgb(0, 0, 0, 1)",
              }}
              center={currentLocation}
              zoom={12}
            >
              {mapLoading && (
                <div className="loading-markers">Loading pharmacies...</div>
              )}
              {pharmacies.map((pharmacy) => (
                <Marker
                  key={pharmacy.id}
                  position={pharmacy.geometry.location}
                  onClick={() => {
                    onMarkerClick(pharmacy);
                    setPharmacyDetails({
                      name: pharmacy.name,
                      postcode: pharmacy.vicinity,
                      open: pharmacy.opening_hours,
                      rating: pharmacy.rating,
                    });
                  }}
                />
              ))}
              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.geometry.location}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="pharmacy-details">
                    <div>
                      <span>Name:</span> {pharmacyDetails.name}
                    </div>
                    <div>
                      <span>Address:</span> {pharmacyDetails.postcode}
                    </div>
                    <div>
                      {pharmacyDetails.open ? (
                        <div
                          style={{
                            color: "rgb(0, 251, 0)",
                            fontWeight: 700,
                          }}
                        >
                          Open
                        </div>
                      ) : (
                        <div
                          style={{
                            color: "red",
                            fontWeight: 700,
                          }}
                        >
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="rating-container">
                      <StarRating rating={pharmacyDetails.rating} />
                      <div>{pharmacyDetails.rating}</div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </Typography>
        </Box>
      </Modal>
      <Modal
        open={openModalGP}
        onClose={handleCloseGP}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <div className="modal-title">GPs</div>
            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "400px",
                marginTop: 20,
                borderRadius: 15,
                boxShadow: "0 5px 5px rgb(0, 0, 0, 1)",
              }}
              center={currentLocation}
              zoom={12}
            >
              {mapLoading && (
                <div className="loading-markers">Loading GP's...</div>
              )}
              {GPs.map((gp) => (
                <Marker
                  key={gp.id}
                  position={gp.geometry.location}
                  onClick={() => {
                    onMarkerClick(gp);
                    setGPDetails({
                      name: gp.name,
                      postcode: gp.vicinity,
                      open: gp.opening_hours,
                      rating: gp.rating,
                    });
                  }}
                />
              ))}
              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.geometry.location}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="pharmacy-details">
                    <div>
                      <span>Name:</span> {GPDetails.name}
                    </div>
                    <div>
                      <span>Address:</span> {GPDetails.postcode}
                    </div>
                    <div>
                      {GPDetails.open ? (
                        <div
                          style={{
                            color: "rgb(0, 251, 0)",
                            fontWeight: 700,
                          }}
                        >
                          Open
                        </div>
                      ) : (
                        <div
                          style={{
                            color: "red",
                            fontWeight: 700,
                          }}
                        >
                          Closed
                        </div>
                      )}
                    </div>
                    <div className="rating-container">
                      <StarRating rating={GPDetails.rating} />
                      <div>{GPDetails.rating}</div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </Typography>
        </Box>
      </Modal>
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
            <div className="locate-container">
              <div className="locate" onClick={showPharmacies}>
                Locate pharmacy
              </div>
              <div className="locate" onClick={showGPs}>
                Locate GP
              </div>
            </div>
            <div className="sign-out" onClick={signOut}>
              <div>Sign out</div>
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
