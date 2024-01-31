import axios from "axios";

const userId = localStorage.getItem("userId");

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
