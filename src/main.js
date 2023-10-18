const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs");
const {
   insertUserData,
   addUserToGroup,
   addGroupToDB,
} = require("./Database/database");
require("dotenv").config();
const { jsonParser } = require("./test");
const { message } = require("telegram/client");
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

   const messages = await client.getMessages("-600277781", {
      q: "Happy Birthday",
      limit: 2000, // The maximum number of messages to retrieve
    });

    

   // Specify the start and end dates for the search
   const startDate = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)); // One year ago
       const endDate = new Date(); // Current date
       client.getMessages()
   
       // Retrieve all messages from the group within the specified timeframe
       const messages = await client.getChatHistory("-600277781", {
         limit: 100, // Adjust the limit as per your needs
         offsetDate: Math.floor(startDate.getTime() / 1000),
         offsetId: 0,
         addOffset: 0,
         minId: 0,
         maxId: 0,
         hash: 0,
      });
      // const result = await client.invoke(
      console.log(messages)
   //    new Api.messages.SearchGlobal({
   //       q: "birthday",
   //       filter: new Api.InputMessagesFilterEmpty({}),
   //       //   offsetRate: 43,
   //       offsetPeer: "@gb0ye",
   //       //   offsetId: 43,
   //       limit: 100,
   //       //   folderId: 43,
   //    })
   // );

   // console.log(result);
   fs.writeFileSync("data.json", JSON.stringify(messages));
   // result.messages.forEach((message) => {
   //    console.log(message.message);
   // });
   //  }
   await client.addEventHandler(async (event) => {
      // console.log(event);
      if (event.className === "UpdateChatParticipants") {
         // console.log("ggggggggggggggg");
         // console.log(event)
         // console.log("fffffffffffffff");
      }

      if (
         event.className === "UpdateNewMessage" ||
         event.className === "UpdateNewChannelMessage"
      ) {
         // console.log(event.message.peerId);
         if (event.message.action.className === "MessageActionChatAddUser") {
            for (const user of event.message.action.users) {
               if (user.value.toString() === process.env.AYOMIDE_ID) {
                  console.log("I was added to a group");
                  const result = await client.invoke(
                     new Api.messages.GetFullChat({
                        //normally chat id for groups start with negative symbol but this doesn't require it
                        chatId: BigInt(
                           `${event.message.peerId.chatId.value.toString()}`
                        ),
                     })
                  );
                  const groupInfo = result.chats[0];
                  const dateAdded = new Date(event.message.date * 1000)
                     .toISOString()
                     .replace("T", " ")
                     .replace("Z", "");
                  await addGroupToDB(
                     groupInfo.id.value.toString(),
                     groupInfo.title,
                     dateAdded,
                     true,
                     event.message.fromId.userId.value.toString()
                  );
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
         const groupId = event.message.peerId.chatId.value.toString();
         const result = await client.invoke(
            new Api.messages.GetFullChat({
               //normally chat id for groups start with negative symbol but this doesn't require it
               chatId: BigInt(`${groupId}`),
            })
         );
         console.log(result.users);

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
            await insertUserData(
               user.id.value.toString(),
               user.username,
               user.firstName,
               user.lastName,
               user.bot,
               user.phone
            );
            await addUserToGroup(user.id.value.toString(), groupId);
         }
         console.log(userData);
      }
      // const csvResult = await jsonParser(userData);
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
