import React, { useRef, useState, useEffect } from "react";
import "../css/main.css";
import Sidebar from "./Sidebar";
import sentences from "../data/responses.json";
import {
  fetchGPs,
  fetchPharmacies,
  postChat,
  postAIChat,
  fetchOpenAiCompletion,
} from "../functions/chatUtils";
import { downloadPdf } from "../functions/pdfGenerator";
import Logo from "../css/assets/Healio Logo.png";
import StarRating from "./StarRating";

import axios from "axios";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

// Mui
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Dot,
  DotGroup,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

import NewChat from "../css/assets/tutorial/New Chat.mp4";
import TypingSymptoms from "../css/assets/tutorial/Typing Symptoms.mp4";
import Diagnosis from "../css/assets/tutorial/Diagnosis.mp4";

export default function Main() {
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const [promptDisabled, setPromptDisabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [title, setTitle] = useState("New Chat");
  const [conversations, setConversations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [pharmacies, setPharmacies] = useState([]);
  const [GPs, setGPs] = useState([]);
  const [pharmacyDetails, setPharmacyDetails] = useState([]);
  const [GPDetails, setGPDetails] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const key = process.env.REACT_APP_API_KEY;
  const mapKey = process.env.REACT_APP_MAPS_API;

  const textareaRef = useRef(null);
  const ref = useRef(HTMLDivElement);
  const chatContainerRef = useRef(null);

  const userId = localStorage.getItem("userId");

  const randomIndex = (option) =>
    Math.floor(Math.random() * sentences[option].length);

  useEffect(() => {
    if (chats.length) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chats.length]);

  // eslint-disable-next-line
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: mapKey,
  });

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

  const resetMap = () => {
    setPharmacies([]);
    setPharmacyDetails([]);
    setGPs([]);
    setGPDetails([]);
  };

  const onMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  // Buttons to expand answer
  const handleOptions = (option, chatIndex) => {
    setChats(
      chats.map((chat, index) => {
        if (index === chatIndex) {
          let updatedChat = { ...chat };

          if (option === 2) {
            resetMap();
            // When 'Pharmacies' is selected
            updateLocation(fetchPharmacies, setPharmacies);
            updatedChat.showPharmacy = !chat.showPharmacy;
            updatedChat.showGp = false; // Explicitly hide GPs map
          } else if (option === 3) {
            resetMap();
            // When 'GPs' is selected
            updateLocation(fetchGPs, setGPs);
            updatedChat.showGp = !chat.showGp;
            updatedChat.showPharmacy = false; // Explicitly hide Pharmacies map
          } else {
            // For other options, just toggle their respective states
            updatedChat.showSymptoms =
              option === 0 ? !chat.showSymptoms : chat.showSymptoms;
            updatedChat.showMedicine =
              option === 1 ? !chat.showMedicine : chat.showMedicine;
          }

          return updatedChat;
        }
        return chat;
      })
    );
  };

  const fetchDiseasePrediction = async (symptoms) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        data: symptoms,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching disease prediction:", error);
      return null;
    }
  };

  // Function to get NHS description of a disease
  const fetchNhsDescription = async (disease) => {
    try {
      const response = await axios.get(
        `https://api.nhs.uk/conditions/${disease}`,
        {
          headers: { "subscription-key": key },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching NHS description:", error);
      throw error;
    }
  };

  // Function to handle chat response
  const processChatResponse = async (disease, alternatives) => {
    const diagnosisStarter =
      sentences.diagnosis_starter[randomIndex("diagnosis_starter")].message;
    const nhsResponse = await fetchNhsDescription(disease);
    const diseaseDescription = nhsResponse.hasPart[0].hasPart[0].text;
    const diseaseMedicine = nhsResponse.hasPart[1].hasPart[0].text;
    disease = disease.replace("-", " ");
    disease = disease.split(" ");

    for (let i = 0; i < disease.length; i++) {
      disease[i] = disease[i][0].toUpperCase() + disease[i].substr(1);
    }

    disease = disease.join(" ");

    return {
      prompt: text,
      response:
        diagnosisStarter +
        "<b>" +
        disease +
        "</b>. However, your symptoms may also align with <b>" +
        alternatives[0].disease +
        "</b> and <b>" +
        alternatives[1].disease +
        "</b>.",
      alternatives: alternatives,
      showSymptoms: false,
      showMedicine: false,
      showPharmacy: false,
      showGp: false,
      diseaseDescription,
      diseaseMedicine,
      options: true,
    };
  };

  const updateConversationTitle = async (newTitle) => {
    if (localStorage.getItem("conversationTitle") === "New Chat") {
      try {
        await axios.put(
          `http://localhost:8080/conversations/${localStorage.getItem(
            "conversationId"
          )}`,
          { title: newTitle }
        );
      } catch (error) {
        console.error("Error updating conversation title:", error);
      }
    }
  };

  // Main function to handle prompts
  const handlePrompts = async (e) => {
    e.preventDefault();
    if (text === "") return;

    setText("");
    textareaRef.current.style.height = "33px";

    try {
      const predictionResponse = await fetchDiseasePrediction(text);
      const confidence = predictionResponse[0].confidence;
      const disease = predictionResponse[0].disease
        .replace(/\s+/g, "-")
        .toLowerCase();

      let newChat;
      if (confidence === 0.32) {
        const openAiResponse = await fetchOpenAiCompletion(text);
        newChat = { prompt: text, response: openAiResponse };
        // Post chats to database, update conversation title, etc.
        await postAIChat(newChat);
        await updateConversationTitle(text);
      } else {
        newChat = await processChatResponse(
          disease,
          predictionResponse.slice(1)
        );
        // Post chats to database, update conversation title, etc.
        await postChat(newChat);
        await updateConversationTitle(predictionResponse[0].disease);
      }

      setChats([...chats, newChat]);
    } catch (error) {
      console.error("Error in handlePrompts:", error);
      // Handle error appropriately
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

  // Trigger the PDF download with the chats data
  const handleExport = () => {
    downloadPdf(chats, "Healio_Diagnosis.pdf", text);
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

  // I have had a continuous cough, sneezing, fever, sore throat and runny nose

  return (
    <>
      <Sidebar
        chats={chats}
        setChats={setChats}
        promp
        setPromptDisabled={setPromptDisabled}
        open={open}
        setOpen={setOpen}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        title={title}
        setTitle={setTitle}
        conversations={conversations}
        setConversations={setConversations}
        getConversations={getConversations}
      />
      <div className="information-icon" onClick={handleOpen}>
        <i class="fa-solid fa-info"></i>
      </div>
      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <div className="modal-title">How to use Healio</div>
            <CarouselProvider
              naturalSlideWidth={100}
              naturalSlideHeight={124}
              totalSlides={3}
              className="carousel-container"
            >
              <Slider className="slider">
                <Slide index={0} className="slide">
                  <video autoPlay loop muted src={NewChat} className="item" />
                </Slide>
                <Slide index={1} className="slide">
                  <video
                    src={TypingSymptoms}
                    autoPlay
                    loop
                    muted
                    className="item"
                  />
                </Slide>
                <Slide index={2} className="slide">
                  <video src={Diagnosis} autoPlay loop muted className="item" />
                </Slide>
              </Slider>
              <div className="buttons-container">
                <ButtonBack className="button">&lt;</ButtonBack>
                <DotGroup />
                <ButtonNext className="button">&gt;</ButtonNext>
              </div>
            </CarouselProvider>
          </Typography>
        </Box>
      </Modal>

      <div className="main-container">
        <div className="conversation-container" ref={chatContainerRef}>
          <div className="prompts">
            {chats.length === 0 ? (
              <div className={open ? "home-screen open" : "home-screen"}>
                <div className="description">
                  Start by typing symptoms you are experiencing.
                </div>
              </div>
            ) : (
              chats.map((chat, index) => {
                return (
                  <div
                    className={open ? "chat-container open" : "chat-container"}
                    ref={ref}
                  >
                    <div className="prompt-container">
                      <div className="account-container">
                        <div className="account">M</div>
                        <div className="prompt-title">You</div>
                      </div>
                      <div className="prompt">{chat.prompt}</div>
                    </div>
                    <div className="prompt-container">
                      <div className="account-container">
                        <img src={Logo} alt="" />
                        <div className="prompt-title healio">Healio</div>
                      </div>
                      {promptDisabled ? (
                        <div
                          className="prompt"
                          id="prompt"
                          dangerouslySetInnerHTML={{
                            __html: chat.response,
                          }}
                        />
                      ) : (
                        <div
                          className="prompt"
                          id="prompt"
                          dangerouslySetInnerHTML={{
                            __html: chat.response,
                          }}
                        />
                      )}
                      {chat.options && (
                        <div
                          className={
                            promptDisabled
                              ? "buttons-container disabled"
                              : "buttons-container"
                          }
                        >
                          <button
                            onClick={() => {
                              handleOptions(0, index);
                            }}
                          >
                            Symptoms
                          </button>
                          <button onClick={() => handleOptions(1, index)}>
                            Medicine
                          </button>
                          <button onClick={() => handleOptions(2, index)}>
                            Locate a Pharmacy
                          </button>
                          <button onClick={() => handleOptions(3, index)}>
                            Locate a GP
                          </button>
                        </div>
                      )}
                      {chat.showSymptoms && (
                        <div
                          className="response-content"
                          dangerouslySetInnerHTML={{
                            __html: chat.diseaseDescription,
                          }}
                        />
                      )}
                      {chat.showMedicine && (
                        <div
                          className="response-content"
                          dangerouslySetInnerHTML={{
                            __html: chat.diseaseMedicine,
                          }}
                        />
                      )}
                      {chat.showPharmacy && (
                        <>
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
                              <div className="loading-markers">
                                Loading pharmacies...
                              </div>
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
                                    <span>Address:</span>{" "}
                                    {pharmacyDetails.postcode}
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
                                    <StarRating
                                      rating={pharmacyDetails.rating}
                                    />
                                    <div>{pharmacyDetails.rating}</div>
                                  </div>
                                </div>
                              </InfoWindow>
                            )}
                          </GoogleMap>
                        </>
                      )}
                      {chat.showGp && (
                        <>
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
                              <div className="loading-markers">
                                Loading GP's...
                              </div>
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
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
            {promptDisabled && (
              <i class="fa-solid fa-download" onClick={handleExport}></i>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
