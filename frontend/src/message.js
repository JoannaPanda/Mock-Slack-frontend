import { apiCallGet } from "./helpers.js";

export const fetchAllMessages = (channelId) => {
  const allMessages = [];

  const fetchNextBatch = (startIndex) => {
    return apiCallGet(
      `/message/${channelId}?start=${startIndex}`,
      {},
      true
    ).then((messageData) => {
      const messages = messageData.messages;
      if (messages.length === 0) {
        return allMessages; // No more messages to fetch
      }

      allMessages.push(...messages);

      // Continue fetching the next batch
      return fetchNextBatch(startIndex + messages.length);
    });
  };

  // Start fetching messages
  return fetchNextBatch(0);
};

export const createReactionButton = (emoji, count, buttonClass) => {
  const reactionItem = document.createElement("span");
  const reactionButton = document.createElement("button");
  reactionButton.style.marginLeft = "0.3rem";
  reactionButton.style.marginRight = "0.2rem";
  reactionButton.textContent = emoji;
  reactionButton.classList.add("btn", buttonClass);

  if (count > 1) {
    const reactionCountSpan = document.createElement("span");
    reactionCountSpan.textContent = count;
    reactionButton.appendChild(reactionCountSpan);
  }

  reactionItem.appendChild(reactionButton);
  return reactionItem;
};
