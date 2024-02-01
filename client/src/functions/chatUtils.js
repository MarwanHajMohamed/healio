import axios from "axios";
import OpenAI from "openai";

const userId = localStorage.getItem("userId");
const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openAiKey,
  dangerouslyAllowBrowser: true,
});

export async function postAIChat(newChat) {
  try {
    const response = await axios.post(`http://localhost:8080/chats`, {
      date: Date.now(),
      recipientMessage: newChat.response,
      senderMessage: newChat.prompt,
      title: newChat.prompt,
      userId: userId,
      conversationId: localStorage.getItem("conversationId"),
    });
    return response.data;
  } catch (error) {
    console.error("Error in postChat:", error);
    throw error; // rethrow the error for the caller to handle
  }
}

export async function postChat(newChat) {
  try {
    const response = await axios.post(`http://localhost:8080/chats`, {
      date: Date.now(),
      recipientMessage:
        newChat.response + newChat.diseaseDescription + newChat.diseaseMedicine,
      senderMessage: newChat.prompt,
      title: newChat.prompt,
      userId: userId,
      conversationId: localStorage.getItem("conversationId"),
    });
    return response.data;
  } catch (error) {
    console.error("Error in postChat:", error);
    throw error; // rethrow the error for the caller to handle
  }
}

export const fetchPharmacies = async (location) => {
  try {
    const response = await axios.get("http://localhost:8080/pharmacies", {
      params: {
        lat: location.lat,
        lng: location.lng,
      },
    });
    return response.data.results; // Ensure this is the correct data structure
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    return []; // Return an empty array in case of an error
  }
};

export const fetchGPs = async (location) => {
  try {
    const response = await axios.get("http://localhost:8080/gp", {
      params: {
        lat: location.lat,
        lng: location.lng,
      },
    });
    return response.data.results; // Ensure this is the correct data structure
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    return []; // Return an empty array in case of an error
  }
};

// Function to handle OpenAI completion
export const fetchOpenAiCompletion = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      max_tokens: 60,
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching OpenAI completion:", error);
    throw error;
  }
};
