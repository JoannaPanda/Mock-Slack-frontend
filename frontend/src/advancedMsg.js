import { fetchAllMessages } from "./message.js";
import { showCustomAlert } from "./helpers.js";

export const openImageModal = (channelId, currentImage) => {
  fetchAllMessages(channelId)
    .then((messages) => {
      const images = messages
        .filter((message) => message.image && message.image !== "")
        .map((message) => message.image);

      let currentImageIndex = images.indexOf(currentImage);

      const imageModal = new bootstrap.Modal(
        document.getElementById("image-modal")
      );
      const modalImage = document.getElementById("modal-curr-image");

      const closeButton = document.getElementById("close-image-model");
      closeButton.addEventListener("click", () => {
        imageModal.hide();
      });

      // Function to update the modal content
      const updateModalContent = () => {
        modalImage.src = images[currentImageIndex];
        modalImage.alt = "Image message";
        modalImage.classList.add("image-enlarged");
        document.getElementById("modal-title").textContent = `Image ${
          currentImageIndex + 1
        } of ${images.length}`;
      };

      const prevButton = document.getElementById("prev-image-button");
      const nextButton = document.getElementById("next-image-button");

      prevButton.addEventListener("click", () => {
        if (currentImageIndex > 0) {
          currentImageIndex--;
          updateModalContent();
        }
      });

      nextButton.addEventListener("click", () => {
        if (currentImageIndex < images.length - 1) {
          currentImageIndex++;
          updateModalContent();
        }
      });

      updateModalContent();
      imageModal.show();
    })
    .catch((error) => {
      showCustomAlert("Error fetching messages: " + error, true);
    });
};
