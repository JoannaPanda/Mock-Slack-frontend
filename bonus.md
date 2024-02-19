Bonus functionality:

1. Name: Frontend Validation for register/login inputs

   Milestone related: 2.1.1, 2.1.2

   Description: This focuses on enhancing the user experience and security of the registration and login processes.

   Registration Form:

   - Email Validation: Users must enter a valid email address. An error message is displayed if the email format is incorrect.
   - Name Validation: Users are required to provide their name.
   - Password Strength: Passwords must be between 8 and 20 characters long.
   - Password Confirmation: The registration form now includes a field to confirm the password. Users are alerted if the password and confirmation do not match.

   Login Form:

   - Email and Password: Users are required to enter their email and password for login.

2. Name: Logout

   Milestone related: 2.1.1, 2.1.2

   Description: The logged in user can click on the logout button to log out. Their stored token will be removed and they are redirected to register page.

3. Name: React to message (mimicing Discord/Teams)

   Milestone related: 2.3.5

   Description: Implement a behavior similar to Discord or Teams, where a hover event triggers a popup to select emoji reactions.
   Allow users to choose from several emoji options by clicking on them within the popup, after a user reacts to a message, display the selected emoji as a button at the bottom of the reacted message.This emoji button behaves as a toggle; clicking on it again will unreact to the message. Use the primary Bootstrap button style (blue background) for emoji buttons under a message when the user has reacted. Clicking it should allow unreacting: Use a different style (white background) for emoji buttons if the react is from other users.

4. Name: Personalized message display options through filtering

   Milestone related: 2.3.7

   Description: We implement a filter to filter out message sent by current user as well as messages pinned. By filtering out message that user sent, the user could find and edit their own messages with ease, improving thier user experience.

5. Name: Pin/Unpin automatic update in pinned message view

   Milestone related: 2.3.4

   Description: Once messages are pinned or unpinned, the pinned messages will automatically update without requiring a page reload/refresh. To view this, first select the filter option as "pinned", then unpin a message from the pinned view, the pinned view will automatically update.

6. Name: Hybrid message: Sending/displaying/editing message with both text and image content

   Milestone related: 2.5.1

   Description: Users can send message with both text and image attached, and the message will be displayed in the channel as text following by the image thumbnail.

7. Name: Ordered image pop-up display model

   Milestone related: 2.5.2

   Description: We implement a bootstrap modal to display the images in the channel, there are arrow buttons allowing the user to view other images sent in the channel. The order when viewing photos in modal is descending message id order, so that users can view latest message images for better UX. Each image showing in the display model has a title "Image {index} of {Total}" so tht user can keep track of their image viewing as well.

8. Name: Auto update user profile (name&photo) in header without refresh when user change their profile

   Milestone related: 2.4.3

   Description: When user change their profile name and/or photo via ther own profile page, it is automatically updated in the header to reflect the change.

9. Name: Push Notification customised

   Milestone related: 2.6.2

   Description: Users receive a customised notification created by a modal as a top pop-up containing "Notification" as title, content including the new message, message sender, and which channel. Clciking on message content will direct user to the exact channel page with new message from other user. This improves the user experience as well as efficiency and utility, and does not need to ask for notification permission. It is also consistent with other customised pop-up notifications.

10. Name: Offline Access Channel list cached

    Milestone related: 2.7.1

    Description: Apart from being able to access the most recent channel user has loaded, such as channel description and messages (with sender name and profile photo displayed in message as well), the user can also view the list of channel (public channels & private channels they joined), same as the channel list they see with internet connection. Trying to open other channels in the list will show an error pop-up, trying to interact will show error pop-up as well.

Style feature:

1. Name: "Edited" message display hovering effect

   Milestone related: 2.3.5

   Issue: Once messages are edited, there is text "Edited" indicating that they have been edited. Since we display the edit timestampalong with the create timestamp, it makes the message element looks a bit crowded.

   Feature description: To imrpove the user experience, where "edited" text is displayed, we utilize the hover effect. When hovering over the "edited" text, the actual edit timestamp is displayed, and it reverts to "edited" when the mouse leaves.

2. Name: "Emoji" reacts pop-up selector

   Feature description: When hovering over a message, this feature displays a handy pop-up menu with a selection of fun emojis to react to messages. The pop-up menu allows user to easily toggle between different emojis, it highlights the emojis you've previously reacted with, making it effortless to track and manage reactions.

3. Name: Styled header

   Feature description: The header contains link to user profile (name & photo display), with a logout button displaying with user is logged in. There is also create channel button showing in header, making it esay for user to access.

4. Name: Display how many users reacted with same emoji

   Feature description: The users can react to message using 7 different emojis that they can freely select. If multiple users react with same emoji, there is a counter number showing to the right of the emoji appearing in message container (like Discord). Unreact will reduce the counter by 1 and if the unreact makes the total reactions with that emoji back to 1, then the counter number is not display (representing 1 reaction).

5. Infinite scroll indicators

   Milestone related: 2.6.1

   Feature description: Once users have reached the end of a set of messages, while the fetch is happening, users see a message "Hold on tight...Your next batch of messages are loading" so that they are aware the loading in process. When all the messages in the channel are loaded, scrolling down will display a message "End of channel messages reached." below all messages so that users know that they have reached the ned of all messages in the channel.
