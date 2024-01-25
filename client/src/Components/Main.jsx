import React, { useRef, useState, useEffect, useCallback } from "react";
import "../css/main.css";
import axios from "axios";
import Sidebar from "./Sidebar";
import sentences from "../data/responses.json";
// import OpenAI from "openai";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { postChat } from "../functions/PostChat";
import { downloadPdf } from "../functions/pdfGenerator";
import Logo from "../css/assets/Healio Logo.png";

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
  const [pharmacyDetails, setPharmacyDetails] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  const key = process.env.REACT_APP_API_KEY;
  // const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const mapKey = process.env.REACT_APP_MAPS_API;

  // const openai = new OpenAI({
  //   apiKey: openAiKey,
  //   dangerouslyAllowBrowser: true,
  // });

  const textareaRef = useRef(null);
  const ref = useRef(HTMLDivElement);
  const chatContainerRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const conversationId = localStorage.getItem("conversationId");

  useEffect(() => {
    if (chats.length) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chats.length]);

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

  const updateLocationAndFetchPharmacies = () => {
    setMapLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(newLocation); // Update location
      fetchPharmacies(newLocation); // Fetch pharmacies with new location
    });
  };

  const fetchPharmacies = async (location) => {
    setMapLoading(true);
    try {
      axios
        .get("http://localhost:8080/pharmacies", {
          params: {
            lat: location.lat,
            lng: location.lng,
          },
        })
        .then((response) => {
          setPharmacies(response.data.results);
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setMapLoading(false);
        });
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      throw error;
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: mapKey,
  });

  // Buttons to expand answer
  const handleOptions = (option, chatIndex) => {
    setChats(
      chats.map((chat, index) => {
        if (index === chatIndex) {
          return {
            ...chat,
            showSymptoms:
              option === 0
                ? !chat.response.showSymptoms
                : (chat.response.showSymptoms,
                  setPharmacies([]),
                  setPharmacyDetails([])),
            showMedicine:
              option === 1
                ? !chat.response.showMedicine
                : (chat.response.showMedicine,
                  setPharmacies([]),
                  setPharmacyDetails([])),
            showPharmacy:
              option === 2
                ? (updateLocationAndFetchPharmacies(),
                  !chat.response.showPharmacy)
                : chat.response.showPharmacy,
          };
        }
        return chat;
      })
    );
  };

  const handlePrompts = async (e) => {
    e.preventDefault();
    if (e.target.value === "") {
      // Handle empty prompt
      return;
    }

    setText("");
    textareaRef.current.style.height = "33px";

    try {
      // Predict disease using model
      const predictionResponse = await axios.post(
        "http://127.0.0.1:5000/predict",
        { data: e.target.value }
      );
      var confidence = predictionResponse.data.confidence;
      var disease = predictionResponse.data.disease
        .replace(/\s+/g, "-")
        .toLowerCase();
      getConversations();

      // Get NHS description of disease
      const nhsResponse = await axios
        .get(`https://api.nhs.uk/conditions/${disease}`, {
          headers: {
            "subscription-key": key,
          },
        })
        .catch(() => {
          setChats([
            ...chats,
            {
              prompt: JSON.parse(predictionResponse.config.data)["data"],
              response: "An error occured. Please try again later",
            },
          ]);
        });

      const diseaseDescription = nhsResponse.data.hasPart[0].hasPart[0].text;
      const diseaseMedicine = nhsResponse.data.hasPart[1].hasPart[0].text;

      const randomIndex = (option) =>
        Math.floor(Math.random() * sentences[option].length);

      const newChat = {
        prompt: "",
        response: "",
        showSymptoms: false,
        showMedicine: false,
        showPharmacy: false,
        diseaseDescription: diseaseDescription,
        diseaseMedicine: diseaseMedicine,
        options: true,
      };

      if (confidence >= 1) {
        // const completion = await openai.chat.completions.create({
        //   messages: [{ role: "user", content: e.target.value }],
        //   max_tokens: 60,
        //   model: "gpt-3.5-turbo",
        // });
        // console.log(completion.choices[0]);
        // setChats([
        //   ...chats,
        //   {
        //     prompt: JSON.parse(predictionResponse.config.data)["data"],
        //     response: completion.choices[0].message.content,
        //   },
        // ]);
        const errorMessage = sentences.error[randomIndex("error")].message;
        setChats([
          ...chats,
          {
            prompt: JSON.parse(predictionResponse.config.data)["data"],
            response: { response: errorMessage },
            options: false,
          },
        ]);
      } else {
        const diagnosisStarter =
          sentences.diagnosis_starter[randomIndex("diagnosis_starter")].message;

        var newResponse =
          diagnosisStarter + "<b>" + predictionResponse.data.disease;

        var databaseResponse =
          diagnosisStarter +
          "<b>" +
          predictionResponse.data.disease +
          "</b>" +
          diseaseDescription +
          diseaseMedicine;

        newChat.prompt = JSON.parse(predictionResponse.config.data)["data"];
        newChat.response = newResponse;

        // const newChat = {
        //   prompt: JSON.parse(predictionResponse.config.data)["data"],
        //   response: newResponse,
        //   showSymptoms: false,
        //   showMedicine: false,
        //   showPharmacy: false,
        //   diseaseDescription: diseaseDescription,
        //   diseaseMedicine: diseaseMedicine,
        //   options: confidence < 1,
        // };

        setChats([
          ...chats,
          {
            prompt: JSON.parse(predictionResponse.config.data)["data"],
            response: newChat,
            options: true,
          },
        ]);

        // Post chats to database
        try {
          await postChat(
            Date.now(),
            databaseResponse,
            newChat.prompt,
            predictionResponse.data.disease,
            userId,
            conversationId
          );
        } catch (error) {
          console.error("Error calling postChat:", error);
        }

        if (localStorage.getItem("conversationTitle") === "New Chat") {
          await axios.put(
            `http://localhost:8080/conversations/${localStorage.getItem(
              "conversationId"
            )}`,
            {
              title: predictionResponse.data.disease,
            }
          );
        }
      }
    } catch (error) {
      console.error("Error in handlePrompts:", error);
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
                            __html: chat.response.response,
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
                            __html: chat.response.diseaseDescription,
                          }}
                        />
                      )}
                      {chat.showMedicine && (
                        <div
                          className="response-content"
                          dangerouslySetInnerHTML={{
                            __html: chat.response.diseaseMedicine,
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
                                  setPharmacyDetails({
                                    name: pharmacy.name,
                                    postcode: pharmacy.vicinity,
                                    open: pharmacy.opening_hours,
                                  });
                                }}
                              />
                            ))}
                          </GoogleMap>
                          {pharmacyDetails.length !== 0 && (
                            <div className="pharmacy-details">
                              <div className="title">Pharmacy Details</div>
                              <div>
                                <span>Name:</span> {pharmacyDetails.name}
                              </div>
                              <div>
                                <span>Address:</span> {pharmacyDetails.postcode}
                              </div>
                              <div>
                                {pharmacyDetails.open ? (
                                  <div style={{ color: "rgb(0, 251, 0)" }}>
                                    Open
                                  </div>
                                ) : (
                                  <div style={{ color: "red" }}>Closed</div>
                                )}
                              </div>
                            </div>
                          )}
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
