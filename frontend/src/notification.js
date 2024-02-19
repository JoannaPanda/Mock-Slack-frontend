import { fetchUserDetails, showCustomAlert, apiCallGet } from "./helpers.js";

let messageIds = {}; // Store the last message ID for each channel

let userToken = null;
let storedUserId = null;

const localStorageToken = localStorage.getItem("token");
const localStorageId = localStorage.getItem("userId");

if (localStorageToken !== null) {
  userToken = localStorageToken;
}

if (localStorageId !== null) {
  storedUserId = parseInt(localStorageId);
}

// Function for display customised notification pop up
const displayNotification = (message, channelName, channelId) => {
  fetchUserDetails(message.sender)
    .then((userData) => {
      const displayMessage = `You recieved a new message from: ${
        userData.name
      }, in channel: ${channelName} #${channelId}, Message: ${
        message.message || "Image content"
      }`;

      showCustomAlert(displayMessage, false);
    })
    .catch((error) => {
      showCustomAlert("Error fetching user details: " + error, true);
    });
};

// Function to get new messages
export const pollForNewMessages = () => {
  if (!userToken) {
    return;
  }

  // Fetch and store the channels you are in
  apiCallGet("/channel", {}, true)
    .then((body) => {
      let channelsIn = [];
      body.channels.forEach((channel) => {
        if (channel.members.includes(storedUserId)) {
          channelsIn.push(channel);
        }
      });

      channelsIn.forEach((channel) => {
        const channelId = channel.id;
        apiCallGet(`/message/${channelId}?start=0`, {}, true)
          .then((messageData) => {
            const messages = messageData.messages;

            if (messages.length > 0) {
              // Initialize messageIds[channelId] if not defined
              if (!messageIds[channelId]) {
                messageIds[channelId] = messages[0].id;
              }

              const latestMessageId = messages[0].id;

              if (latestMessageId > messageIds[channelId]) {
                // New messages have arrived
                messageIds[channelId] = latestMessageId; // Update the last message ID

                // show push notification only if other user post new messages
                if (messages[0].sender !== storedUserId) {
                  // Process and display the new message
                  displayNotification(messages[0], channel.name, channelId);
                }
              }
            }
          })
          .catch((error) => {
            console.log("Error polling for new messages:" + error);
          });
      });
    })
    .catch((error) => {
      console.log("Error fetching channels:" + error);
    });
};
