import { BACKEND_PORT } from "./config.js";

let userToken = null;
let storedUserId = null;

const profileLink = document.getElementById("profile-link");
const localStorageToken = localStorage.getItem("token");
const localStorageId = localStorage.getItem("userId");

if (localStorageToken !== null) {
  userToken = localStorageToken;
}

if (localStorageId !== null) {
  storedUserId = parseInt(localStorageId);
}

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
  const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const valid = validFileTypes.find((type) => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error("provided file is not a png, jpg or jpeg image.");
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

// Function to make a GET request to the API
export const apiCallGet = (path, body, authed = false) => {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:${BACKEND_PORT}${path}`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: authed ? `Bearer ${userToken}` : undefined,
      },
    })
      .then((response) => response.json())
      .then((body) => {
        if (body.error) {
          reject(body.error);
        } else {
          resolve(body);
        }
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

// Function to make a POST request to the API
export const apiCallPost = (path, body, authed = false) => {
  return new Promise((callbackSuccess, callbackError) => {
    fetch(`http://localhost:${BACKEND_PORT}${path}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json",
        Authorization: authed ? `Bearer ${userToken}` : undefined,
      },
    })
      .then((response) => response.json())
      .then((body) => {
        if (body.error) {
          callbackError(body.error);
        } else {
          callbackSuccess(body);
        }
      });
  });
};

// Function to make a DELETE request to the API
export const apiCallDelete = (path, authed = false) => {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:${BACKEND_PORT}${path}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        Authorization: authed ? `Bearer ${userToken}` : undefined,
      },
    }).then((response) => {
      if (!response.ok) {
        reject("Failed to delete data");
      } else {
        resolve();
      }
    });
  });
};

// Function to make a PUT request to the API
export const apiCallPut = (path, body, authed = false) => {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:${BACKEND_PORT}${path}`, {
      method: "PUT", // Use the PUT method for updating resources
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json",
        Authorization: authed ? `Bearer ${userToken}` : undefined,
      },
    })
      .then((response) => response.json())
      .then((body) => {
        if (body.error) {
          reject(body.error);
        } else {
          resolve(body);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Function to show a custom alert
export const showCustomAlert = (message, isError) => {
  // Set the error message in the modal
  const customErrorModal = new bootstrap.Modal(
    document.getElementById("custom-error-modal")
  );
  const customErrorMessage = document.getElementById("custom-error-message");
  customErrorMessage.textContent = message;
  const modalLabel = document.getElementById("custom-error-modal-label");
  if (isError) {
    modalLabel.textContent = "Error";
  } else {
    modalLabel.textContent = "Notification";
    if (message.startsWith("You recieved a new message from:")) {
      // Use the regex to find the channelId
      const channelIdMatch = message.match(/#(\d{6})/);
      const channelId = channelIdMatch[1];

      customErrorMessage.addEventListener("click", () => {
        window.location.hash = `#channel=${channelId}`;
      });
    }
  }

  const closeButton = document.querySelector(
    "#custom-error-modal .modal-header .close"
  );
  closeButton.addEventListener("click", () => {
    customErrorModal.hide();
  });

  const closeFooterButton = document.querySelector(
    "#custom-error-modal .modal-footer button"
  );
  closeFooterButton.addEventListener("click", () => {
    customErrorModal.hide();
  });

  // Show the Bootstrap modal
  customErrorModal.show();
};

// Function to fetch the user's details based on user ID
export const fetchUserDetails = (userId) => {
  return apiCallGet(`/user/${userId}`, {}, true);
};

// Helper function for creating user profile name/photo div element
export const helperCreateUserProfImg = (
  userImageDiv,
  parentDiv,
  userId,
  senderName,
  userPhoto
) => {
  const senderNameElement = document.createElement("div");
  senderNameElement.textContent = senderName;
  senderNameElement.classList.add("font-weight-bold", "text-black");

  // Add an event listener to the sender's name
  senderNameElement.addEventListener("click", () => {
    // Navigate to the user's profile screen based on their user ID
    if (userId === storedUserId) {
      window.location.hash = "#profile";
    } else {
      window.location.hash = `#profile=${userId}`;
    }
  });
  userImageDiv.appendChild(senderNameElement);

  // Create an <img> element for the user's profile image
  if (userPhoto) {
    const senderImage = document.createElement("img");
    senderImage.src = userPhoto;
    senderImage.alt = "User profile image";
    senderImage.classList.add("rounded-circle");
    if (parentDiv === profileLink) {
      userImageDiv.setAttribute("id", "header-user-image");
      senderImage.style.width = "1.7rem";
      senderImage.style.height = "1.7rem";
    } else {
      senderImage.style.width = "4vw";
      senderImage.style.height = "4vw";
    }

    // Add an event listener to the sender's profile image
    senderImage.addEventListener("click", () => {
      if (userId === storedUserId) {
        window.location.hash = "#profile";
      } else {
        window.location.hash = `#profile=${userId}`;
      }
    });

    userImageDiv.appendChild(senderImage);
  } else {
    // Use a default image if the user's image is null
    const defaultImage = document.createElement("img");
    // Attribution: profile.png from Flaticon.com
    defaultImage.src = "/images/profile.png";
    defaultImage.alt = "User profile image";
    defaultImage.classList.add("rounded-circle");

    if (parentDiv === profileLink) {
      defaultImage.style.width = "3vw";
    } else {
      defaultImage.style.width = "6vw";
    }

    defaultImage.addEventListener("click", () => {
      if (userId === storedUserId) {
        window.location.hash = "#profile";
      } else {
        window.location.hash = `#profile=${userId}`;
      }
    });
    userImageDiv.appendChild(defaultImage);
  }
};
