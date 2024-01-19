import React, { useRef, useState, useEffect } from "react";
import "../css/main.css";
import axios from "axios";
import Sidebar from "./Sidebar";
import jsPDF from "jspdf";
import sentences from "../data/responses.json";
import OpenAI from "openai";

export default function Main() {
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const [promptDisabled, setPromptDisabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [title, setTitle] = useState("New Chat");

  const key = process.env.REACT_APP_API_KEY;
  const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;

  const openai = new OpenAI({
    apiKey: openAiKey,
    dangerouslyAllowBrowser: true,
  });

  const textareaRef = useRef(null);
  const ref = useRef(HTMLDivElement);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chats.length) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chats.length]);

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
      console.log("Disease prediction: ", predictionResponse.data.disease);
      console.log("Confidence: ", predictionResponse.data.confidence);
      var confidence = predictionResponse.data.confidence;
      var disease = predictionResponse.data.disease
        .replace(/\s+/g, "-")
        .toLowerCase();

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
            response: errorMessage,
          },
        ]);
      } else {
        const newDiagnosisSentence =
          sentences.diagnosis_starter[randomIndex("diagnosis_starter")].message;
        var newResponse =
          newDiagnosisSentence +
          "<b>" +
          predictionResponse.data.disease +
          "</b>" +
          diseaseDescription +
          diseaseMedicine;

        const newChat = {
          prompt: JSON.parse(predictionResponse.config.data)["data"],
          response: newResponse,
        };

        setChats([
          ...chats,
          {
            prompt: JSON.parse(predictionResponse.config.data)["data"],
            response: newResponse,
          },
        ]);

        // Post chats to database
        await axios.post(`http://localhost:8080/chats`, {
          date: Date.now(),
          recipientMessage: newResponse,
          senderMessage: newChat.prompt,
          title: predictionResponse.data.disease,
          userId: localStorage.getItem("userId"),
          conversationId: localStorage.getItem("conversationId"),
        });

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

  // Export as PDF
  const downloadPdf = (chats, name) => {
    const doc = new jsPDF();
    // Set background colour
    const backgroundColor = [26, 54, 26];
    doc.setFillColor(...backgroundColor);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");

    let yPosition = 40; // Initial Y position for first line of text
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - margin * 2; // Maximum width of text per line
    const textWidth = doc.getTextWidth(text);

    doc.setTextColor("white");
    doc.setFontSize(20);
    doc.text("Healio", (pageWidth - 15 - textWidth) / 2, 20);

    chats.forEach((chat) => {
      doc.setFontSize(14);
      doc.setTextColor("black");
      // Add user prompt to PDF
      let lines = doc.splitTextToSize(`You: ${chat.prompt}`, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += (lines.length + 0.5) * 7; // Increment Y position for spacing

      // Add Healio response to PDF, ensuring HTML tags are removed
      let responseText = chat.response.replace(/<[^>]*>?/gm, ""); // Remove HTML tags
      lines = doc.splitTextToSize(`Healio: ${responseText}`, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += (lines.length + 0.5) * 7; // Increment Y position for spacing

      // Check if we need to add a new page
      if (yPosition >= doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 10; // Reset Y position for the new page
      }
    });

    doc.save(name);
  };

  // Trigger the PDF download with the chats data
  const handleExport = () => {
    downloadPdf(chats, "Healio_Diagnosis.pdf");
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
              chats.map((chat) => {
                return (
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
                      <div
                        className="prompt"
                        id="prompt"
                        dangerouslySetInnerHTML={{ __html: chat.response }}
                      />
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
            {chats.length === 0 ? (
              // <i class="fa-solid fa-file-export disabled"></i>
              <i class="fa-solid fa-download disabled"></i>
            ) : (
              // <i class="fa-solid fa-file-export" onClick={handleExport}></i>
              <i class="fa-solid fa-download" onClick={handleExport}></i>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
