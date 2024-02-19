/**
 * COMP6080 Assignment 3
 * Author: Yuemeng Yin
 * Last edited: 27/10/2001
 */

/**
 * Section: Supporting js file improts and variable declaration
 */
// Helper functions from helper.js
import {
  fileToDataUrl,
  apiCallGet,
  apiCallPost,
  apiCallDelete,
  apiCallPut,
  showCustomAlert,
  fetchUserDetails,
} from "./helpers.js";
// Helper functions from auth.js for handling authentication
import { handleLogin, handleLogout, handleRegister } from "./auth.js";
import { handleCreateChannel, showChannelDetails } from "./channel.js";
import { createUserProfileImg, helperBuildUserProfile } from "./userProfile.js";
import { fetchAllMessages, createReactionButton } from "./message.js";
import { openImageModal } from "./advancedMsg.js";
import { pollForNewMessages } from "./notification.js";

let userToken = null;
let storedUserId = null;
let start = 0; // initialize the message index for infinite scrolling
let currChannelId = null; // Define current channelId
const pollInterval = 1000; // 1 second

const registerSubmit = document.getElementById("register-submit");
const loginSubmit = document.getElementById("signin-submit");
const logoutButton = document.getElementById("logout-button");
const createChannelButton = document.getElementById("create-channel-button");
const createChannelForm = document.getElementById("channel-create-form");
const leaveChannelButton = document.getElementById("leave-channel-button");
const joinChannelButton = document.getElementById("join-channel-button");
const pageDashboard = document.getElementById("page-dashboard");
const channelDetails = document.getElementById("channel-details");
const defaultMessage = document.getElementById("default-message");
const editChannelForm = document.getElementById("channel-edit-form");
const messageContainer = document.getElementById("message-container");
const loadIndicator = document.getElementById("loading-indicator");
const endIndicator = document.getElementById("end-indicator");
const sendButton = document.getElementById("send-button");
const messageInputBar = document.getElementById("message-input-container");
const filterDropdown = document.getElementById("filter-dropdown");
const inviteUsersButton = document.getElementById("invite-users-confirm");
const userList = document.getElementById("user-invite-list");
const profileLink = document.getElementById("profile-link");

/**
 * Section: functions for dashboard and channels display
 */

// Function for loading the dashboard, display a channel list
const loadDashboard = () => {
  // only show default message when no channel is selected
  channelDetails.style.display = "none";
  joinChannelButton.style.display = "none";
  loadIndicator.style.display = "none";
  endIndicator.style.display = "none";
  messageInputBar.style.display = "none";
  filterDropdown.style.display = "none";

  // clear content in profileLink
  while (profileLink.firstChild) {
    profileLink.removeChild(profileLink.firstChild);
  }

  // Create a div for the user profile image
  const userImageDiv = document.createElement("div");
  userImageDiv.classList.add("text-center", "mr-2");
  userImageDiv.setAttribute("id", "header-user-image");
  profileLink.appendChild(userImageDiv);

  createUserProfileImg(userImageDiv, profileLink, storedUserId);

  apiCallGet("/channel", {}, true)
    .then((body) => {
      createChannelList(body);
    })
    .catch((error) => {
      const cachedList = JSON.parse(localStorage.getItem("channelsList"));

      if (cachedList) {
        createChannelList(cachedList);
      } else {
        showCustomAlert("Failed to load channels: " + error, true);
      }
    });
};

const createChannelList = (body) => {
  // clear previous cache
  localStorage.removeItem("channelsList");
  // cache cureenet channel messages
  const cachedChannels = body;
  localStorage.setItem("channelsList", JSON.stringify(cachedChannels));

  const publicChannels = [];
  const privateChannels = [];
  body.channels.forEach((channel) => {
    switch (true) {
      // If public channel
      case !channel.private:
        publicChannels.push(channel);
        break;
      // If private channel that user has not joined, do not display
      case !channel.members.includes(storedUserId):
        break;
      // If private channel that user has joined
      default:
        privateChannels.push(channel);
    }
  });

  // Display the channels in the sidebar
  const channelList = document.getElementById("channel-list");

  // clear content in the channel list
  while (channelList.firstChild) {
    channelList.removeChild(channelList.firstChild);
  }
  // clear content in invite users form
  while (userList.firstChild) {
    userList.removeChild(userList.firstChild);
  }

  // Create list items for public channels
  publicChannels.forEach((channel) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    listItem.textContent = channel.name;

    const badge = document.createElement("span");
    badge.classList.add("badge", "bg-success");
    badge.textContent = "Public";

    listItem.appendChild(badge);
    listItem.setAttribute("channel-id", channel.id);
    listItem.addEventListener("click", () => {
      window.location.hash = `#channel=${channel.id}`;
      if (!channel.members.includes(storedUserId)) {
        channelDetails.style.display = "none";
        defaultMessage.style.display = "none";
        joinChannelButton.style.display = "block";
      }
    });
    channelList.appendChild(listItem);
  });

  // Create list items for private channels
  privateChannels.forEach((channel) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    listItem.textContent = channel.name;

    const badge = document.createElement("span");
    badge.classList.add("badge", "bg-warning");
    badge.textContent = "Private";

    listItem.appendChild(badge);
    listItem.setAttribute("channel-id", channel.id);
    listItem.addEventListener("click", () => {
      window.location.hash = `#channel=${channel.id}`;
    });
    channelList.appendChild(listItem);
  });
};

// Function for transitioning between screens
const showPage = (pageName) => {
  for (const page of document.querySelectorAll(".page-block")) {
    page.style.display = "none";
  }
  document.getElementById(`page-${pageName}`).style.display = "block";
  if (pageName === "dashboard") {
    window.location.hash = "";
    loadDashboard();
  }
};

const getChannelDetails = (channelId) => {
  currChannelId = channelId; // Set the channelId

  // clear content in the message container
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild);
  }

  // clear content in invite users form
  while (userList.firstChild) {
    userList.removeChild(userList.firstChild);
  }

  endIndicator.style.display = "none";
  filterDropdown.style.display = "none";
  apiCallGet(`/channel/${channelId}`, {}, true)
    .then((channel) => {
      showChannelDetails(channel, channelId);
      start = 0;
      const selectedFilter = filterDropdown.value;
      switch (true) {
        case selectedFilter === "Pinned":
          fetchPinnedMessages(channelId);
          break;
        case selectedFilter === "Mysent":
          fetchMyMessages(channelId);
          break;
        default:
          fetchChannelMessages(channelId, start);
      }
      // cache channel messages
      fetchAllMessages(currChannelId)
        .then((allMessages) => {
          // clear previous cache
          localStorage.removeItem("channelMessages");
          // cache cureenet channel messages
          const cachedMessages = {};
          cachedMessages[currChannelId] = allMessages;
          localStorage.setItem(
            "channelMessages",
            JSON.stringify(cachedMessages)
          );
        })
        .catch((error) => {
          showCustomAlert("Error fetching messages: " + error, true);
        });
    })
    .catch((error) => {
      const cachedChannel = JSON.parse(localStorage.getItem("channelDetails"));
      if (
        cachedChannel[channelId] &&
        error !== "Authorised user is not a member of this channel"
      ) {
        showCustomAlert("Showing cached channel details", false);
        showChannelDetails(cachedChannel[channelId], channelId);
        const cachedMessages = JSON.parse(
          localStorage.getItem("channelMessages")
        );
        if (cachedMessages[channelId]) {
          cachedMessages[channelId].forEach((message) => {
            // Create message elements
            const messageElement = createMessageElement(message);
            messageContainer.appendChild(messageElement);
          });
        }
      } else {
        if (error === "Authorised user is not a member of this channel") {
          joinChannelButton.style.display = "block";
        }
        showCustomAlert("Failed to get channel details: " + error, true);
      }
    });
};

/**
 * Section: Functions for Messages display and interaction
 */

const createMessageElement = (message) => {
  const messageDiv = document.createElement("div");
  messageDiv.setAttribute("id", `message-${currChannelId}-${message.id}`);
  messageDiv.classList.add(
    "message",
    "m-2",
    "p-3",
    "border",
    "rounded",
    "d-flex",
    "align-items-center"
  );

  // Create a div for the user profile image
  const userImageDiv = document.createElement("div");
  userImageDiv.classList.add("text-center", "mr-2");
  messageDiv.appendChild(userImageDiv);

  createUserProfileImg(userImageDiv, messageDiv, message.sender);
  // Add message timestamp
  const timestamp = new Date(message.sentAt).toLocaleString();
  const timestampElement = document.createElement("div");
  timestampElement.textContent = timestamp;
  timestampElement.classList.add("text-muted", "small");
  userImageDiv.appendChild(timestampElement);

  // if edited add edit timestamp
  if (message.edited) {
    const editTimestamp = new Date(message.editedAt).toLocaleString();
    const editTimestampElement = document.createElement("div");

    const editedContainer = document.createElement("div");
    editedContainer.classList.add("text-muted", "small", "edited-container");

    editedContainer.textContent = "edited";
    editedContainer.setAttribute("data-edit-timestamp", editTimestamp);
    userImageDiv.appendChild(editedContainer);

    // Add a hover effect to show the edit timestamp
    editedContainer.addEventListener("mouseenter", () => {
      // Show the edit timestamp when hovering
      const timestamp = editedContainer.getAttribute("data-edit-timestamp");
      editedContainer.textContent = timestamp;
    });

    // Remove the edit timestamp on mouse leave
    editedContainer.addEventListener("mouseleave", () => {
      editedContainer.textContent = "edited";
    });
  }

  // Add message content
  const messageContentDiv = document.createElement("div");
  messageContentDiv.classList.add("flex-grow-1", "message-content");
  if (message.message) {
    messageContentDiv.textContent = message.message;
  }
  if (message.image) {
    const imageMessage = document.createElement("img");
    imageMessage.src = message.image;
    imageMessage.alt = "Image message";
    imageMessage.classList.add("image-thumbnail");

    // Add a click event to open the image in a modal
    imageMessage.addEventListener("click", () => {
      openImageModal(currChannelId, message.image);
    });

    messageContentDiv.appendChild(imageMessage);
  }

  messageDiv.appendChild(messageContentDiv);

  // Check if the sender of the message is the logged in user
  if (message.sender === storedUserId) {
    const editButton = document.createElement("button");
    const penEmoji = document.createTextNode("✏️"); // Pen emoji
    editButton.appendChild(penEmoji);
    editButton.classList.add("btn", "ml-2");
    editButton.addEventListener("click", () => {
      editMessage(message, messageDiv);
    });
    messageDiv.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("btn", "btn-danger", "ml-2");
    deleteButton.addEventListener("click", () => {
      deleteMessage(message.id);
    });

    messageDiv.appendChild(deleteButton);
  }

  // Create a section for reactions
  const reactionSection = document.createElement("div");
  reactionSection.classList.add("reactions");
  showCurrReactions(message, reactionSection);

  // Attach a hover event listener to show reactions popup
  messageDiv.addEventListener("mouseenter", () => {
    showEmojiPopup(message, reactionSection);
  });

  messageDiv.appendChild(reactionSection);

  // Add a Pin button
  const pinButton = document.createElement("button");
  pinButton.setAttribute("id", "pin-button");
  pinButton.textContent = "🖌️ not pinned";
  pinButton.classList.add("btn", "btn-outline-secondary", "ml-2");
  if (message.pinned) {
    pinButton.textContent = "📌 pinned";
  }
  pinButton.addEventListener("click", () => {
    if (message.pinned) {
      unpinMessage(currChannelId, message.id);
    } else {
      pinMessage(currChannelId, message.id);
    }
  });
  messageDiv.appendChild(pinButton);

  return messageDiv;
};

// Function to display the reactions popup when hovering over a message
const showEmojiPopup = (message, reactionSection) => {
  const reactions = message.reacts;
  // Create a popup element for selecting reactions
  const popup = document.createElement("div");
  popup.classList.add("emoji-popup");

  // List of available emoji reactions
  const emojis = ["❤️️", "👍", "😀", "😂", "🥰", "🤩", "🤯"];

  emojis.forEach((emoji) => {
    const emojiButton = document.createElement("button");
    emojiButton.textContent = emoji;

    // Check if the user has reacted with this emoji
    const userReactions = reactions.filter(
      (reaction) => reaction.user === storedUserId
    );

    if (userReactions.some((reaction) => reaction.react === emoji)) {
      emojiButton.classList.add("btn", "btn-primary");
    }

    emojiButton.addEventListener("click", () => {
      if (userReactions.some((reaction) => reaction.react === emoji)) {
        // Unreact
        unreactToMessage(currChannelId, message, emoji);
        emojiButton.classList.remove("btn-primary");
      } else {
        // React
        reactToMessage(currChannelId, message, emoji);
        emojiButton.classList.add("btn-primary");
      }

      // Close the popup after reacting or unreacting
      popup.remove();
    });

    popup.appendChild(emojiButton);
  });

  reactionSection.appendChild(popup);
};

const showCurrReactions = (message, reactionDiv) => {
  const reactionList = document.createElement("div");
  reactionList.classList.add("reactions");

  if (!message.reacts) {
    return;
  }

  // Count the number of users who have reacted with each emoji
  const reactionCounts = {};
  const usedReactions = [];

  message.reacts.forEach((reaction) => {
    if (!reactionCounts[reaction.react]) {
      reactionCounts[reaction.react] = 1;
    } else {
      reactionCounts[reaction.react]++;
    }
  });

  const userReactions = message.reacts.filter(
    (reaction) => reaction.user === storedUserId
  );

  // Show the user's reaction emoji first
  userReactions.forEach((reaction) => {
    if (!usedReactions.includes(reaction.react)) {
      usedReactions.push(reaction.react);
      const reactionItem = createReactionButton(
        reaction.react,
        reactionCounts[reaction.react],
        "btn-primary"
      );
      reactionItem.addEventListener("click", () => {
        // Handle unreact
        unreactToMessage(currChannelId, message, reaction.react);
      });
      reactionList.appendChild(reactionItem);
    }
  });

  // Show other users' reaction emoji, avoid repetition
  const otherReactions = message.reacts.filter(
    (reaction) =>
      reaction.user !== storedUserId &&
      !userReactions.some(
        (userReaction) => userReaction.react === reaction.react
      )
  );

  otherReactions.forEach((reaction) => {
    if (!usedReactions.includes(reaction.react)) {
      usedReactions.push(reaction.react);
      const reactionItem = createReactionButton(
        reaction.react,
        reactionCounts[reaction.react],
        "btn-light"
      );
      reactionItem.addEventListener("click", () => {
        // Handle react
        reactToMessage(currChannelId, message, reaction.react);
      });
      reactionList.appendChild(reactionItem);
    }
  });

  // Add the list of reactions to the reactionDiv
  reactionDiv.appendChild(reactionList);
};

const fetchPinnedMessages = (channelId) => {
  fetchAllMessages(channelId)
    .then((allMessages) => {
      const pinnedMessage = allMessages.filter((msg) => msg.pinned === true);
      pinnedMessage.forEach((message) => {
        const messageElement = createMessageElement(message);
        messageContainer.appendChild(messageElement);
      });
    })
    .catch((error) => {
      showCustomAlert("Error fetching pinned messages: " + error, true);
    });
};

const fetchMyMessages = (channelId) => {
  fetchAllMessages(channelId)
    .then((allMessages) => {
      const mySentMessage = allMessages.filter(
        (msg) => msg.sender === storedUserId
      );
      mySentMessage.forEach((message) => {
        const messageElement = createMessageElement(message);
        messageContainer.appendChild(messageElement);
      });
    })
    .catch((error) => {
      showCustomAlert("Error fetching my sent messages: " + error, true);
    });
};

// Function to refresh a specific message in the current channel
const refreshMessage = (channelId, messageId) => {
  // Get the updated message
  fetchAllMessages(channelId)
    .then((allMessages) => {
      const updatedMessage = allMessages.filter((msg) => msg.id === messageId);

      // Find the existing message element
      const existingMessageElement = document.getElementById(
        `message-${channelId}-${messageId}`
      );
      if (existingMessageElement) {
        // Create a new message element based on the updated message
        const updatedMessageElement = createMessageElement(updatedMessage[0]);

        // Replace the existing message element with the updated one
        existingMessageElement.replaceWith(updatedMessageElement);
      }
    })
    .catch((error) => {
      showCustomAlert("Error fetching all messages: " + error, true);
    });
};

// Function to react to a message with an emoji
const reactToMessage = (channelId, message, emoji) => {
  // Send a POST request to react to the message
  apiCallPost(
    `/message/react/${channelId}/${message.id}`,
    { react: emoji },
    true
  )
    .then((response) => {
      refreshMessage(channelId, message.id);
    })
    .catch((error) => {
      showCustomAlert("Error reacting to the message: " + error, true);
    });
};

// Function to unreact from a message
const unreactToMessage = (channelId, message, emoji) => {
  // Send a POST request to unreact from the message
  apiCallPost(
    `/message/unreact/${channelId}/${message.id}`,
    { react: emoji },
    true
  )
    .then((response) => {
      refreshMessage(channelId, message.id);
    })
    .catch((error) => {
      showCustomAlert("Error unreacting from the message: " + error, true);
    });
};

// Function to pin a message
const pinMessage = (channelId, messageId) => {
  apiCallPost(`/message/pin/${channelId}/${messageId}`, {}, true)
    .then(() => {
      refreshMessage(channelId, messageId);
      const selectedFilter = filterDropdown.value;
      if (selectedFilter === "Pinned") {
        getChannelDetails(channelId);
      }
    })
    .catch((error) => {
      showCustomAlert("Failed to pin the message: " + error, true);
    });
};

// Function to unpin a message
const unpinMessage = (channelId, messageId) => {
  apiCallPost(`/message/unpin/${channelId}/${messageId}`, {}, true)
    .then(() => {
      refreshMessage(channelId, messageId);
      const selectedFilter = filterDropdown.value;
      if (selectedFilter === "Pinned") {
        getChannelDetails(channelId);
      }
    })
    .catch((error) => {
      showCustomAlert("Failed to unpin the message: " + error, true);
    });
};

let loading = false; // Flag to prevent concurrent API calls (infinite scroll for messages)

const fetchChannelMessages = (channelId, startIndex) => {
  endIndicator.style.display = "none";

  if (loading) return;
  loading = true;

  apiCallGet(`/message/${channelId}?start=${startIndex}`, {}, true)
    .then((messageData) => {
      // Check if there are more messages to fetch
      if (messageData.messages.length === 0) {
        loading = false;
        loadIndicator.style.display = "none";
        endIndicator.style.display = "block";
        return;
      }
      messageData.messages.forEach((message) => {
        // Create message elements
        const messageElement = createMessageElement(message);
        messageContainer.appendChild(messageElement);
      });

      // Hide the loading indicator
      loadIndicator.style.display = "none";

      // Update the start index for the next batch
      start += messageData.messages.length;
      loading = false;
    })
    .catch((error) => {
      showCustomAlert("Error fetching channel messages: " + error, true);
      loading = false;
    });
};

// function for sending new message
const sendMessage = (message, image) => {
  if (!message.trim() && !image) {
    showCustomAlert("Please enter a message or select an image.", false);
    return;
  }
  const newMessage = {};
  if (message.trim()) {
    newMessage.message = message;
  }

  if (image) {
    newMessage.image = image;
  } else {
    newMessage.image = ""; // Send an empty image url if no image
  }

  if (image) {
    fileToDataUrl(image)
      .then((imageData) => {
        newMessage.image = imageData; // Set the image data

        // Send a request inside this callback
        apiCallPost(`/message/${currChannelId}`, newMessage, true)
          .then(() => {
            document.getElementById("message-form").reset();
            // After sending the message, fetch and update the channel messages
            getChannelDetails(currChannelId);
          })
          .catch((msg) => {
            showCustomAlert("Failed to send the message: " + msg, true);
          });
      })
      .catch((error) => {
        showCustomAlert("Failed to process the image: " + error, true);
      });
  } else {
    // No image selected, send the request immediately
    apiCallPost(`/message/${currChannelId}`, newMessage, true)
      .then(() => {
        document.getElementById("message-form").reset();
        getChannelDetails(currChannelId);
      })
      .catch((msg) => {
        showCustomAlert("Failed to send the message: " + msg, true);
      });
  }
};

// Function to delete a message
const deleteMessage = (messageId) => {
  // Make a DELETE request to delete the message
  apiCallDelete(`/message/${currChannelId}/${messageId}`, true)
    .then(() => {
      // Message deleted, fetch and update the channel
      getChannelDetails(currChannelId);
    })
    .catch((error) => {
      showCustomAlert("Error deleting message: " + error, true);
    });
};

const editMessage = (message, messageDiv) => {
  const currMessageContent = message.message || "";
  const currImg = message.image || "";

  const editImageInput = document.createElement("input");
  editImageInput.type = "file";
  editImageInput.accept = "image/*";
  // Create a text input for editing the message content
  const editTextarea = document.createElement("textarea");
  editTextarea.textContent = currMessageContent;

  // Create a button for saving the edited message
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.classList.add("btn", "btn-sm", "btn-success");
  saveButton.addEventListener("click", () => {
    const newMessageContent = editTextarea.value;
    const newImage = editImageInput.files[0];

    if (!newMessageContent.trim() && !newImage) {
      showCustomAlert("Please enter a message or select an image.", false);
      return;
    }

    const newMessage = {};
    if (newMessageContent.trim()) {
      newMessage.message = newMessageContent;
    }

    if (newImage) {
      // Use the helper function to convert the new image file to a Data URL
      fileToDataUrl(newImage)
        .then((imageData) => {
          // Check if the message content has changed
          if (
            newMessageContent === currMessageContent &&
            imageData === currImg
          ) {
            showCustomAlert(
              "Message content must be different from the original!",
              true
            );
            return;
          }

          newMessage.image = imageData; // Set the image data
          // Send a PUT request
          apiCallPut(
            `/message/${currChannelId}/${message.id}`,
            newMessage,
            true
          )
            .then((response) => {
              refreshMessage(currChannelId, message.id);
            })
            .catch((error) => {
              showCustomAlert("Failed to edit message: " + error, true);
            });
        })
        .catch((error) => {
          showCustomAlert("Error converting the image: " + error, true);
        });
    } else {
      if (newMessageContent === currMessageContent && currImg === "") {
        showCustomAlert(
          "Message content must be different from the original!",
          true
        );
        return;
      }
      // No image selected, send the request immediately
      // Send a PUT request
      apiCallPut(`/message/${currChannelId}/${message.id}`, newMessage, true)
        .then((response) => {
          refreshMessage(currChannelId, message.id);
        })
        .catch((error) => {
          showCustomAlert("Failed to edit message: " + error, true);
        });
    }
  });

  // Create a "Cancel" button for canceling the edit
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.classList.add("btn", "btn-sm", "btn-danger");
  cancelButton.addEventListener("click", () => {
    editTextarea.remove();
    editImageInput.remove();
    saveButton.remove();
    cancelButton.remove();
    getChannelDetails(currChannelId);
  });

  // clear messageDiv
  while (messageDiv.firstChild) {
    messageDiv.removeChild(messageDiv.firstChild);
  }
  messageDiv.appendChild(editTextarea);
  messageDiv.appendChild(editImageInput);
  messageDiv.appendChild(saveButton);
  messageDiv.appendChild(cancelButton);
};

// Event listener for sending a new message
sendButton.addEventListener("click", () => {
  const messageText = document.getElementById("message-input").value;
  const imageFile = document.getElementById("image-input").files[0];
  sendMessage(messageText, imageFile);
});

// Infinite scroll: listening for the scroll event on #page-dashboard
pageDashboard.addEventListener("scroll", () => {
  const selectedFilter = filterDropdown.value;
  if (selectedFilter !== "All") {
    return;
  }

  // Calculate scroll position based on #page-dashboard's height
  const messageContainerHeight = messageContainer.clientHeight;
  const scrollY = pageDashboard.scrollTop;
  const dashboardHeight = pageDashboard.clientHeight;

  // Check if the user has reached the end of initial set of messages
  if (scrollY + dashboardHeight >= messageContainerHeight - 100) {
    // Show the loading indicator
    loadIndicator.style.display = "block";

    // Introduce a delay before fetching the next set of messages, so that the loading message is displayed
    setTimeout(() => {
      // Fetch the next set of messages
      fetchChannelMessages(currChannelId, start);
    }, 1700);
  }
});

/**
 * Section: Function for fragment based url routing
 */

window.addEventListener("hashchange", () => {
  // Check if the URL contains a #profile fragment
  if (window.location.hash.startsWith("#profile")) {
    let ownProfile = window.location.hash === "#profile";
    let urlUserId = storedUserId;
    if (!ownProfile) {
      urlUserId = parseInt(window.location.hash.substring(9)); // Extract the user ID
      ownProfile = urlUserId === storedUserId;
    }
    // Call a function to fetch and display the user's profile, edit options for the user's own profile
    fetchUserDetails(urlUserId).then((userData) => {
      displayUserProfile(userData, ownProfile);
    });
  }

  // Check if the URL contains a #channel= fragment
  if (window.location.hash.startsWith("#channel=")) {
    const urlChannelId = parseInt(window.location.hash.substring(9)); // Extract the channel id
    // Call a function to fetch and display the channel
    showPage("dashboard");
    getChannelDetails(urlChannelId);
  }
});

/**
 * Section: Functions for User profile display and edit
 */

// Show the edit profile modal
const showEditProfileModal = () => {
  const editProfileModal = new bootstrap.Modal(
    document.getElementById("edit-profile-modal")
  );
  editProfileModal.show();

  // Add an event listener to the "Close" button to hide it
  const closeModalButton = document.getElementById("close-edit-profile");
  closeModalButton.addEventListener("click", () => {
    editProfileModal.hide();
  });

  const passwordField = document.getElementById("edit-password");
  const togglePassword = document.getElementById("toggle-password-visibility");

  // Initial state is hidden
  let isPasswordVisible = false;

  togglePassword.addEventListener("click", () => {
    if (isPasswordVisible) {
      // If the password is visible, hide it
      passwordField.type = "password";
      togglePassword.textContent = "Show";
    } else {
      // If the password is hidden, show it
      passwordField.type = "text";
      togglePassword.textContent = "Hide";
    }

    isPasswordVisible = !isPasswordVisible;
  });

  const submitProfileEdit = document.getElementById("save-profile-changes");
  submitProfileEdit.addEventListener("click", () => {
    fetchUserDetails(storedUserId).then((userData) => {
      const editProfileName =
        document.getElementById("edit-profile-name").value;
      const editBio = document.getElementById("edit-bio").value;
      const editProfileEmail = document.getElementById("edit-email").value;
      const editPass = document.getElementById("edit-password").value;
      const editProfileImage = document.getElementById("edit-profile-image");
      const imageFile = editProfileImage.files[0];

      const updatedData = {};

      if (editProfileName) {
        updatedData.name = editProfileName;
      }
      if (editBio) {
        updatedData.bio = editBio;
      }

      if (editProfileEmail) {
        updatedData.email = editProfileEmail;
      }

      if (editPass) {
        updatedData.password = editPass;
      }

      // Handle the image upload separately
      if (imageFile) {
        // Use the fileToDataUrl function to convert the image file to a data URL
        fileToDataUrl(imageFile)
          .then((imageData) => {
            updatedData.image = imageData; // Set the image data

            // Send a request to update the profile inside this callback
            sendEditProfileRequest(updatedData, editProfileModal);
          })
          .catch((error) => {
            showCustomAlert(
              "Error converting image file to data URL:" + error,
              true
            );
          });
      } else {
        // No image selected, send the request immediately
        sendEditProfileRequest(updatedData, editProfileModal);
      }
    });
  });
};

const sendEditProfileRequest = (data, editProfileModal) => {
  if (Object.keys(data).length === 0) {
    // No fields are updated
    editProfileModal.hide();
    showCustomAlert(
      "Please input at least one value for email, password, name, bio, and image.",
      true
    );
    return;
  }

  // Send a PUT request to update profile
  apiCallPut("/user", data, true)
    .then((response) => {
      showCustomAlert("User profile updated successfully!", false);
      fetchUserDetails(storedUserId).then((userData) => {
        displayUserProfile(userData, true);
        // Create a div for the user profile image
        const userImageDiv = document.createElement("div");
        userImageDiv.classList.add("text-center", "mr-2");
        const oldUserImageDiv = document.getElementById("header-user-image");

        createUserProfileImg(userImageDiv, profileLink, storedUserId);
        oldUserImageDiv.replaceWith(userImageDiv);
      });
    })
    .catch((error) => {
      showCustomAlert("Failed to update user profile: " + error, true);
    });

  editProfileModal.hide();
};

// Function to display the user's profile on the profile screen
const displayUserProfile = (userData, isOwnProfile) => {
  helperBuildUserProfile(userData);
  const profileScreen = document.getElementById("page-profile-screen");

  const backButton = document.createElement("button");
  backButton.textContent = "Back to dashboard";
  backButton.classList.add("btn", "ml-2", "btn-primary");
  backButton.addEventListener("click", () => {
    showPage("dashboard");
    window.location.hash = "";
    location.reload();
  });

  if (isOwnProfile) {
    const editButton = document.createElement("button");
    editButton.textContent = "Edit profile";
    // Add an event listener to the button to show the modal
    editButton.addEventListener("click", () => {
      showEditProfileModal();
    });

    profileScreen.appendChild(editButton);
  }
  profileScreen.appendChild(backButton);

  showPage("profile-screen");
};

/**
 * Section: Event listeners
 */

// Add an event listener for the profile link
profileLink.addEventListener("click", () => {
  // Check if the user is logged in
  if (userToken) {
    // Redirect to the user's own profile
    window.location.hash = "#profile";
  }
});

// Event Listener for invite user button
inviteUsersButton.addEventListener("click", () => {
  const selectedUserIds = Array.from(
    document.querySelectorAll("#user-invite-list input[type=checkbox]:checked")
  ).map((checkbox) => parseInt(checkbox.value, 10));

  if (selectedUserIds.length > 0) {
    // Make a POST request to invite the selected users to the channel
    selectedUserIds.forEach((uid) => {
      apiCallPost(`/channel/${currChannelId}/invite`, { userId: uid }, true)
        .then((response) => {
          showCustomAlert("User(s) have been invited to the channel!", false);
        })
        .catch((error) => {
          showCustomAlert("Failed to invite users: " + error, true);
        });
    });
    getChannelDetails(currChannelId);
  } else {
    showCustomAlert("Please select at least one user to invite.", true);
  }
});

// Handle the Leave Channel button click
leaveChannelButton.addEventListener("click", () => {
  apiCallPost(`/channel/${currChannelId}/leave`, {}, true)
    .then(() => {
      showCustomAlert("You have left the channel.", false);
      //refreshing the channel list
      showPage("dashboard");
      // clear content in the message container
      while (messageContainer.firstChild) {
        messageContainer.removeChild(messageContainer.firstChild);
      }
    })
    .catch((error) => {
      showCustomAlert("Failed to leave the channel: " + error, true);
    });
});

registerSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  handleRegister().then((resp) => {
    if (resp === "dashboard") {
      showPage("dashboard");
      location.reload();
    }
  });
});

loginSubmit.addEventListener("click", (e) => {
  handleLogin().then((resp) => {
    if (resp === "dashboard") {
      showPage("dashboard");
      location.reload();
    }
  });
});

logoutButton.addEventListener("click", (e) => {
  handleLogout().then((resp) => {
    if (resp === "register") {
      showPage("register");
      location.reload();
    }
  });
});

filterDropdown.addEventListener("change", () => {
  getChannelDetails(currChannelId);
});

createChannelForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleCreateChannel().then((resp) => {
    if (resp === "dashboard") {
      showPage("dashboard");
      location.reload();
    }
  });
});

editChannelForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const channelId = currChannelId;
  const editName = document.getElementById("edit-channel-name").value;
  const editDescription = document.getElementById("edit-channel-desc").value;
  if (!editName && !editDescription) {
    showCustomAlert(
      "Please input at least one of the new channel name and description.",
      true
    );
    return;
  }

  const updatedData = {};
  if (editName) {
    updatedData.name = editName;
  }
  if (editDescription) {
    updatedData.description = editDescription;
  }

  // Send a PUT request to update channel details
  apiCallPut(`/channel/${channelId}`, updatedData, true)
    .then((response) => {
      showCustomAlert("Channel details updated successfully!", false);
      showPage("dashboard");
      window.location.hash = `#channel=${channelId}`;
    })
    .catch((error) => {
      showCustomAlert("Failed to update channel details: " + error, true);
    });
});

joinChannelButton.addEventListener("click", () => {
  // Perform the join action
  apiCallPost(`/channel/${currChannelId}/join`, {}, true)
    .then((response) => {
      showCustomAlert("You have joined the channel!", false);
      // Update the page to reflect the user's membership
      showPage("dashboard");
      window.location.hash = `#channel=${currChannelId}`;
    })
    .catch((error) => {
      showCustomAlert("Failed to join the channel: " + error, true);
    });
});

for (const redirect of document.querySelectorAll(".redirect")) {
  const newPage = redirect.getAttribute("redirect");
  redirect.addEventListener("click", () => {
    showPage(newPage);
  });
}

// 2.6.2 Push notification: polling for new messages, intermittent requests
setInterval(pollForNewMessages, pollInterval);

const localStorageToken = localStorage.getItem("token");
const localStorageId = localStorage.getItem("userId");

if (localStorageToken !== null) {
  userToken = localStorageToken;
}
if (localStorageId !== null) {
  storedUserId = parseInt(localStorageId);
}

if (userToken === null) {
  logoutButton.style.display = "none";
  createChannelButton.style.display = "none";
  showPage("register");
} else {
  logoutButton.style.display = "block";
  createChannelButton.style.display = "block";
  showPage("dashboard");
}
