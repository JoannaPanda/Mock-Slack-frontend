import {
  fetchUserDetails,
  helperCreateUserProfImg,
  showCustomAlert,
} from "./helpers.js";

// Function for create a user profile name& photo component
export const createUserProfileImg = (userImageDiv, parentDiv, userId) => {
  // Add sender's name
  fetchUserDetails(userId)
    .then((userData) => {
      const senderName = userData.name;
      const userPhoto = userData.image;

      // Cache new channel user name and profile image
      const cachedUsers =
        JSON.parse(localStorage.getItem("channelUsers")) || {};
      if (!cachedUsers[userId]) {
        cachedUsers[userId] = userData;
        // Store channel details in local storage
        localStorage.setItem("channelUsers", JSON.stringify(cachedUsers));
      }
      helperCreateUserProfImg(
        userImageDiv,
        parentDiv,
        userId,
        senderName,
        userPhoto
      );
    })
    .catch((error) => {
      const cachedUsers = JSON.parse(localStorage.getItem("channelUsers"));
      if (cachedUsers[userId]) {
        const cachedUserName = cachedUsers[userId].name;
        const cachedUserPhoto = cachedUsers[userId].image;
        helperCreateUserProfImg(
          userImageDiv,
          parentDiv,
          userId,
          cachedUserName,
          cachedUserPhoto
        );
      } else {
        showCustomAlert("Error fetching user details: " + error, true);
      }
    });
};

export const helperBuildUserProfile = (userData) => {
  // Create and style the profile screen elements
  const profileScreen = document.getElementById("page-profile-screen");

  // clear content in the profile div
  while (profileScreen.firstChild) {
    profileScreen.removeChild(profileScreen.firstChild);
  }

  const profileImage = document.createElement("img");
  // Attribution: profile.png from Flaticon.com
  profileImage.src = userData.image || "/images/profile.png";
  profileImage.alt = "Profile image";
  profileImage.classList.add("rounded-circle");
  profileImage.style.width = "7vw";
  if (userData.image) {
    profileImage.style.height = "7vw";
    profileImage.style.border = "solid 0.2rem";
  }

  const profileName = document.createElement("h2");
  profileName.textContent = userData.name;
  profileName.classList.add("text-primary");

  const profileBio = document.createElement("p");
  profileBio.textContent = "Bio: " + userData.bio || "No bio available";

  const profileEmail = document.createElement("p");
  profileEmail.textContent = `Email: ${userData.email}`;

  profileScreen.appendChild(profileImage);
  profileScreen.appendChild(profileName);
  profileScreen.appendChild(profileBio);
  profileScreen.appendChild(profileEmail);
};
