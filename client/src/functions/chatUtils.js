import axios from "axios";
import OpenAI from "openai";

const userId = localStorage.getItem("userId");
const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;
const key = process.env.REACT_APP_API_KEY;

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
        newChat.response +
        newChat.diseaseDescription +
        newChat.diseaseTreatment,
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

export const fetchDiseasePrediction = async (symptoms) => {
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
export const fetchNhsDescription = async (disease) => {
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

// Function to handle OpenAI completion
export const fetchOpenAiCompletion = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      //   max_tokens: 10,
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching OpenAI completion:", error);
    throw error;
  }
};

// Get alternative disease description, symptoms and treatment
export const processAlternativeDisease = async (disease, chats, setChats) => {
  const nhsResponse = await fetchNhsDescription(disease);

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

  //   Format disease name to remove any symbols and capitalise letters
  var formattedDisease = disease.replace("-", " ");
  formattedDisease = formattedDisease.split(" ");
  for (let i = 0; i < formattedDisease.length; i++) {
    formattedDisease[i] =
      formattedDisease[i][0].toUpperCase() + formattedDisease[i].substr(1);
  }
  formattedDisease = formattedDisease.join(" ");

  const newChat = {
    prompt: formatDisease(disease),
    response: "",
    alternatives: [],
    showDescription: false,
    showSymptoms: false,
    showTreatment: false,
    diseaseSymptoms,
    diseaseDescription,
    diseaseTreatment,
    options: true,
  };

  return newChat;
};

export function formatDisease(str) {
  str = str.replace(/-/g, " ");
  return str
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the array back into a string
}
