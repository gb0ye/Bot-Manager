const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
require("dotenv").config();

const apiId = 24999139;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SHESS); // fill this later with the value from session.save()

(async () => {
   console.log("Loading interactive example...");
   const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
   });
   await client.connect();
   console.log("You should now be connected.");

   await client.addEventHandler(async (event) => {
      if (event.className === "UpdateChatParticipants") console.log(event);
   });
})();
