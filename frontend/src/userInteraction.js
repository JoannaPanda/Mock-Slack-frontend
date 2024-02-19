import { apiCallGet, fetchUserDetails, showCustomAlert } from "./helpers.js";

const userList = document.getElementById("user-invite-list");

// Populate the user invite modal
export const populateUserList = (channel) => {
  let usersToDisplay = [];
  // Fetch the list of users
  apiCallGet("/user", {}, true)
    .then((body) => {
      // Mapping of user IDs to names
      const userIdToName = {};

      // Fetch user details and populate userIdToName
      const userDetailPromises = body.users.map((user) => {
        return fetchUserDetails(user.id)
          .then((userData) => {
            userIdToName[user.id] = userData.name;
          })
          .catch((error) => {
            showCustomAlert("Error fetching user details: " + error, true);
          });
      });

      // Wait for all user details to be fetched
      return Promise.all(userDetailPromises)
        .then(() => {
          body.users.forEach((user) => {
            if (!channel.members.includes(user.id)) {
              usersToDisplay.push(user);
            }
          });

          // Sort users based on user names (case-insensitive)
          usersToDisplay.sort((a, b) => {
            const nameA = userIdToName[a.id].toLowerCase();
            const nameB = userIdToName[b.id].toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            // If names are the same, compare by ID
            return a.id - b.id;
          });

          usersToDisplay.forEach((user) => {
            const listItem = document.createElement("li");
            listItem.classList.add(
              "list-group-item",
              "d-flex",
              "justify-content-between",
              "align-items-center"
            );

            const userName = document.createElement("span");
            userName.style.color = "black";
            userName.innerText = userIdToName[user.id];

            const userId = document.createElement("span");
            userId.style.color = "grey";
            userId.style.fontSize = "12px";
            userId.innerText = `#${user.id}`;

            const userCheckbox = document.createElement("input");
            userCheckbox.type = "checkbox";
            userCheckbox.value = user.id;

            listItem.appendChild(userCheckbox);
            listItem.appendChild(userName);
            listItem.appendChild(userId);

            userList.appendChild(listItem);
          });

          if (usersToDisplay.length === 0) {
            const noInvite = document.createElement("span");
            noInvite.innerText = "Oops, no users to invite!";
            userList.appendChild(noInvite);
          }
        })
        .catch((error) => {
          showCustomAlert("Error fetching user list: " + error, true);
        });
    })
    .catch((error) => {
      console.log("Error fetching user list: " + error);
    });
};
