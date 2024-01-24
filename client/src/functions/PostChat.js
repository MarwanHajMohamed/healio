import axios from "axios";

async function postChat(
  date,
  recipientMessage,
  senderMessage,
  title,
  userId,
  conversationId
) {
  try {
    const response = await axios.post(`http://localhost:8080/chats`, {
      date: date,
      recipientMessage: recipientMessage,
      senderMessage: senderMessage,
      title: title,
      userId: userId,
      conversationId: conversationId,
    });
    return response.data;
  } catch (error) {
    console.error("Error in postChat:", error);
    throw error; // rethrow the error for the caller to handle
  }
}

export { postChat };
