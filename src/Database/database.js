const { Pool } = require("pg");
require("dotenv").config();

const client = new Pool({
   connectionString: process.env.DB_CONNECTION_STRING,
   ssl: {
      rejectUnauthorized: false,
   },
});

// Function to insert data into the "users" table
async function insertUserData(
   chatId,
   username,
   firstname,
   lastname,
   isBot,
   phonenumber
) {
   try {
      // SQL query for insertion
      const query = `
      INSERT INTO users (chatId, username, firstname, lastname, isBot, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `;

      // Values to be inserted
      const values = [
         chatId,
         username,
         firstname,
         lastname,
         isBot,
         phonenumber,
      ];

      // Insert the data into the database
      const result = await client.query(query, values);

      // Log the inserted data
      console.log("Data inserted successfully:", result.rows[0]);
   } catch (error) {
      if (error.code === "23505") {
         console.log(
            "User with the same chat id already exists. Ignoring input."
         );
      } else {
         console.error("Error occurred while inserting user:", error);
      }
   }
}

// Function to add a user to a group
async function addUserToGroup(userChatId, groupId) {
   try {
      const query = "INSERT INTO user_groups (userid, groupid) VALUES ($1, $2)";
      const values = [userChatId, groupId];

      await client.query(query, values);

      console.log("User added to group successfully!");
   } catch (error) {
      console.error("Error adding user to group:", error);
   }
}

async function addGroupToDB(
   groupId,
   groupTitle,
   dateAddedToGroup,
   weatherAlerts,
   invitedBy
) {
   try {
      const query =
         "INSERT INTO groups(groupId, groupTitle, dateAddedToGroup, weatherAlerts, invitedBy) VALUES ($1, $2, $3, $4, $5)";
      const values = [
         groupId,
         groupTitle,
         dateAddedToGroup,
         weatherAlerts,
         invitedBy,
      ];

      await client.query(query, values);

      console.log("Group added to database successfully!");
   } catch (error) {
      if (error.code === "23505") {
         console.log(
            "Group with the same  groupId already exists. Ignoring input."
         );
      }
      console.error("Error adding group to database:", error);
   }
}

module.exports = { insertUserData, addUserToGroup, addGroupToDB };
