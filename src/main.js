const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { insertUserData } = require("./Database/database");
require("dotenv").config();
const { jsonParser } = require("./test");
let csvResult = [];

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

   //    const r = await client.getEntity("-1921190464")
   //    console.log(r)

   await client.addEventHandler(async (event) => {
      console.log(event);
      if (event.className === "UpdateChatParticipants") {
         // console.log(event, "fffffffffffffff");
         // console.log(event.participants.participants)
      }

      if (event.className === "UpdateNewMessage") {
         console.log(event.message.peerId);
         if (event.message.action.className === "MessageActionChatAddUser") {
            for (const user of event.message.action.users) {
               if (user.value.toString() === process.env.AYOMIDE_ID) {
                  console.log("I was added to a group");
                  client.sendMessage(
                     `-${event.message.peerId.chatId.toString()}`,
                     {
                        message:
                           "Group Manager Added, please make me an admin to use bot functionalities",
                     }
                  );
                  //   await addUser()
               }
            }
         }

         const userData = [];
         const result = await client.invoke(
            new Api.messages.GetFullChat({
               //normally chat id for groups start with negative symbol but this doesn't require it
               chatId: BigInt(
                  `${event.message.peerId.chatId.value.toString()}`
               ),
            })
         );
         console.log(result);
         const usersInfo = result.users;
         for (user of usersInfo) {
            const obj = {
               UserName: user.username,
               FirstName: user.firstName,
               LastName: user.lastName,
               "Phone Number": user.phone,
               Instruction: "PLEASE FILL OUT DATE OF BIRTH",
               "Date Of Birth": null,
            };
            userData.push(obj);
            insertUserData(
               user.id.value.toString(),
               user.username,
               user.firstName,
               user.lastName,
               user.bot,
               user.phone
            );
         }
      }
      // console.log(userData);
      const csvResult = await jsonParser(userData);
   });

   async function addUser(chatId, userId, fwdLimit) {
      await client.connect(); // This assumes you have already authenticated with .start()

      const result = await client.invoke(
         new Api.messages.AddChatUser({
            chatId: BigInt(chatId),
            userId: userId,
            fwdLimit: fwdLimit,
         })
      );
      console.log(result);
   }
})();
