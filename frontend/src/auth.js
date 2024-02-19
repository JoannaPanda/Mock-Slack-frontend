import { apiCallPost, showCustomAlert } from "./helpers.js";

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

export const handleRegister = () => {
  return new Promise((resolve, reject) => {
    const email = document.getElementById("register-email").value;
    const name = document.getElementById("register-name").value;
    const password = document.getElementById("register-pass").value;
    const passwordConfirm = document.getElementById(
      "register-pass-confirm"
    ).value;
    const passStrong = password.length >= 8 && password.length <= 20;
    const regexMatch = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    switch (true) {
      case !email.trim():
        showCustomAlert("Please type in an email address.", true);
        reject("Please type in an email address.");
        break;
      case !regexMatch.test(email):
        showCustomAlert("Please type in a valid email address.", true);
        reject("Please type in a valid email address.");
        break;
      case !name.trim():
        showCustomAlert("Please type in your name.", true);
        reject("Please type in your name.");
        break;
      case !passStrong:
        showCustomAlert("Your password is not 8-20 characters long.", true);
        reject("Your password is not 8-20 characters long.");
        break;
      case password !== passwordConfirm:
        showCustomAlert(
          "Your password and confirm password are not matching.",
          true
        );
        reject("Passwords do not match.");
        break;
      default:
        apiCallPost("/auth/register", {
          email: email,
          name: name,
          password: password,
        })
          .then((body) => {
            const { token, userId } = body;
            userToken = token;
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            resolve("dashboard");
          })
          .catch((msg) => {
            showCustomAlert(msg, true);
            reject(msg);
          });
    }
  });
};

export const handleLogin = () => {
  return new Promise((resolve, reject) => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;

    apiCallPost("/auth/login", {
      email: email,
      password: password,
    })
      .then((body) => {
        const { token, userId } = body;
        userToken = token;
        storedUserId = userId;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        resolve("dashboard");
      })
      .catch((msg) => {
        showCustomAlert(msg, true);
        reject(msg);
      });
  });
};

export const handleLogout = () => {
  return new Promise((resolve, reject) => {
    apiCallPost("/auth/logout", {}, true)
      .then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        resolve("register");
      })
      .catch((msg) => {
        showCustomAlert(msg, true);
        reject(msg);
      });
  });
};
