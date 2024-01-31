import axios from "axios";

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
