const { Pool } = require("pg");
require("dotenv").config();

// Function to insert data into the "users" table
async function insertUserData(
   chatId,
   username,
   firstname,
   lastname,
   isBot,
   phonenumber
) {
   const client = new Pool({
      connectionString: process.env.DB_CONNECTION_STRING,
      ssl: {
         rejectUnauthorized: false,
      },
   });

   try {
      // Connect to the database
      await client.connect();

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
   } catch (err) {
      if (err.code === "23505") {
         console.log(
            "User with the same chat id already exists. Ignoring input."
         );
      } else {
         console.error("Error occurred while inserting user:", err);
      }
   } finally {
      // Disconnect from the database
      await client.end();
   }
}

// Function to add a user to a group
async function addUserToGroup(userChatId, groupId) {
   const client = new Pool({
      connectionString: process.env.DB_CONNECTION_STRING,
      ssl: {
         rejectUnauthorized: false,
      },
   });

   try {
      await client.connect();

      const query =
         "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)";
      const values = [userChatId, groupId];

      await client.query(query, values);

      console.log("User added to group successfully!");
   } catch (error) {
      console.error("Error adding user to group:", error);
   } finally {
      await client.end();
   }
}

// Example usage
addUserToGroup(123456789, 987654321);

// Example usage of the function

module.exports = { insertUserData, addUserToGroup };
