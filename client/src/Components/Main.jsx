import React, { useRef, useState, useEffect } from "react";
import "../css/main.css";
import Sidebar from "./Sidebar";
import sentences from "../data/responses.json";
import {
  postChat,
  postAIChat,
  fetchOpenAiCompletion,
  fetchDiseasePrediction,
  fetchNhsDescription,
} from "../functions/chatUtils";
import { downloadPdf } from "../functions/pdfGenerator";
import Logo from "../css/assets/Healio Logo.png";

// Axios
import axios from "axios";

// Mui
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

// Carousel
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  DotGroup,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

import NewChat from "../css/assets/tutorial/New Chat.mp4";
import EnterSymptoms from "../css/assets/tutorial/Enter Symptoms.mp4";
import Diagnosis from "../css/assets/tutorial/Diagnosis.mp4";

export default function Main() {
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const [promptDisabled, setPromptDisabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [title, setTitle] = useState("New Chat");
  const [conversations, setConversations] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

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

  // Buttons to expand answer
  const handleOptions = (option, chatIndex) => {
    setChats(
      chats.map((chat, index) => {
        if (index === chatIndex) {
          let updatedChat = { ...chat };

          updatedChat.showDescription =
            option === 0 ? !chat.showDescription : chat.showDescription;
          updatedChat.showSymptoms =
            option === 1 ? !chat.showSymptoms : chat.showSymptoms;
          updatedChat.showTreatment =
            option === 2 ? !chat.showTreatment : chat.showTreatment;

          return updatedChat;
        }
        return chat;
      })
    );
  };

  // Function to handle chat response
  const processChatResponse = async (disease, alternatives) => {
    // Set the sentence starter
    const diagnosisStarter =
      sentences.diagnosis_starter[randomIndex("diagnosis_starter")].message;

    // Fetch NHS description of disease
    const nhsResponse = await fetchNhsDescription(disease);

    // Split description to Symptoms and Treatment
    var diseaseSymptoms = nhsResponse.hasPart[0].hasPart[0].text;
    var diseaseTreatment = nhsResponse.hasPart[1].hasPart[0].text;

    const getDiseaseDescription = await fetchOpenAiCompletion(
      `What is a ${disease}? Summarise it in one short paragraph.`
    );
    var diseaseDescription = getDiseaseDescription;

    if (disease === "allergies") {
      diseaseSymptoms = nhsResponse.hasPart[1].hasPart[0].text;
      diseaseTreatment = nhsResponse.hasPart[5].hasPart[0].text;
    }

    // Format disease name to remove any symbols and capitalise letters
    var formattedDisease = disease.replace("-", " ");
    formattedDisease = formattedDisease.split(" ");
    for (let i = 0; i < formattedDisease.length; i++) {
      formattedDisease[i] =
        formattedDisease[i][0].toUpperCase() + formattedDisease[i].substr(1);
    }
    formattedDisease = formattedDisease.join(" ");

    // Format alternative diseases for research
    var altDisease1 = alternatives[0].disease.replace(/\s/g, "-");
    var altDisease2 = alternatives[1].disease.replace(/\s/g, "-");

    return {
      prompt: text,
      response:
        diagnosisStarter +
        `<b><a href='https://www.nhs.uk/conditions/${disease}' target=”_blank” class='disease-link'>` +
        formattedDisease +
        `</a></b>. However, your symptoms may also align with <b><a href='https://www.nhs.uk/conditions/${altDisease1}' target=”_blank” class='disease-link'>` +
        alternatives[0].disease +
        `</a></b> and <b><a href='https://www.nhs.uk/conditions/${altDisease2}' target=”_blank” class='disease-link'>` +
        alternatives[1].disease +
        "</a></b>.<br><br>",
      alternatives: alternatives,
      showDescription: false,
      showSymptoms: false,
      showTreatment: false,
      diseaseSymptoms,
      diseaseDescription,
      diseaseTreatment,
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
                    src={EnterSymptoms}
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
                            Description
                          </button>
                          <button
                            onClick={() => {
                              handleOptions(1, index);
                            }}
                          >
                            Symptoms
                          </button>
                          <button onClick={() => handleOptions(2, index)}>
                            Treatment
                          </button>
                        </div>
                      )}
                      {chat.showDescription && (
                        <div>
                          <div
                            className="response-content"
                            dangerouslySetInnerHTML={{
                              __html: chat.diseaseDescription,
                            }}
                          />
                        </div>
                      )}
                      {chat.showSymptoms && (
                        <div>
                          <div
                            className="response-content"
                            dangerouslySetInnerHTML={{
                              __html: chat.diseaseSymptoms,
                            }}
                          />
                        </div>
                      )}
                      {chat.showTreatment && (
                        <div
                          className="response-content"
                          dangerouslySetInnerHTML={{
                            __html: chat.diseaseTreatment,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div
              className={
                open ? "nhs-image-container open" : "nhs-image-container"
              }
            >
              <img
                src={localStorage.getItem("nhsImage")}
                alt="NHS content supplied by the NHS website"
                className="nhs-image"
              />
            </div>
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
