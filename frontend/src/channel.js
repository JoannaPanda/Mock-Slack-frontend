import { apiCallPost, showCustomAlert, fetchUserDetails } from "./helpers.js";

// Helper functions from userInteraction.js
import { populateUserList } from "./userInteraction.js";

let storedUserId = null;
const localStorageId = localStorage.getItem("userId");

if (localStorageId !== null) {
  storedUserId = parseInt(localStorageId);
}

const editChannelButton = document.getElementById("edit-channel-button");
const leaveChannelButton = document.getElementById("leave-channel-button");
const joinChannelButton = document.getElementById("join-channel-button");
const channelDetails = document.getElementById("channel-details");
const defaultMessage = document.getElementById("default-message");
const messageContainer = document.getElementById("message-container");
const messageInputBar = document.getElementById("message-input-container");
const filterDropdown = document.getElementById("filter-dropdown");
const userList = document.getElementById("user-invite-list");

export const handleCreateChannel = () => {
  return new Promise((resolve, reject) => {
    const name = document.getElementById("channel-name").value;
    const description = document.getElementById("channel-description").value;
    const type = document.querySelector(
      'input[name="channel-type"]:checked'
    ).value;

    // Send a POST request to create a new channel
    apiCallPost(
      "/channel",
      {
        name: name,
        description: description,
        private: type === "private",
      },
      true
    )
      .then((channelData) => {
        const newChannelId = channelData.channelId;

        showCustomAlert(
          `New ${type} channel #${newChannelId} created successfully!`,
          false
        );
        // Update the channel list on dashboard slidebar accordingly
        resolve("dashboard");
      })
      .catch((error) => {
        showCustomAlert("Channel creation failed: " + error, true);
      });
  });
};

export const showChannelDetails = (channel, currChannelId) => {
  channelDetails.style.display = "block";
  defaultMessage.style.display = "none";
  joinChannelButton.style.display = "none";
  messageInputBar.style.display = "flex";
  filterDropdown.style.display = "block";

  // clear content in the message container
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild);
  }

  // clear content in invite users form
  while (userList.firstChild) {
    userList.removeChild(userList.firstChild);
  }

  const channelName = document.getElementById("channel-display-name");
  const channelDescription = document.getElementById("channel-display-desc");
  const channelType = document.getElementById("channel-display-type");
  const channelCreator = document.getElementById("channel-creator");
  const channelCreatedAt = document.getElementById("channel-created-at");

  channelName.innerText = `Channel: ${channel.name}`;
  channelDescription.innerText = `Description: ${channel.description}`;
  channelType.innerText = `Type: ${channel.private ? "Private" : "Public"}`;
  fetchUserDetails(channel.creator)
    .then((userData) => {
      channelCreator.innerText = `Creator: ${userData.name}`;

      // Store channel creator in local storage
      localStorage.removeItem("channelCreator");
      const cachedCreator = {};
      cachedCreator[currChannelId] = userData.name;
      localStorage.setItem("channelCreator", JSON.stringify(cachedCreator));
    })
    .catch((error) => {
      const cachedCreator = JSON.parse(localStorage.getItem("channelCreator"));
      if (cachedCreator[currChannelId]) {
        channelCreator.innerText = `Creator: ${cachedCreator[currChannelId]}`;
      } else {
        showCustomAlert("Error fetching user details: " + error, true);
      }
    });

  channelCreatedAt.innerText = `Created At: ${new Date(
    channel.createdAt
  ).toLocaleString()}`;

  // Show edit and leave buttons if the user is a channel member
  if (channel.members.includes(storedUserId)) {
    editChannelButton.style.display = "block";
    leaveChannelButton.style.display = "block";
    populateUserList(channel);
  } else {
    editChannelButton.style.display = "none";
    leaveChannelButton.style.display = "none";
    // Show join button if channel is public and user is not member
    joinChannelButton.style.display = "block";
  }

  // Clear previous cached channel
  localStorage.removeItem("channelDetails");
  const cachedChannel = {};
  cachedChannel[currChannelId] = channel;
  // Store channel details in local storage
  localStorage.setItem("channelDetails", JSON.stringify(cachedChannel));
};
