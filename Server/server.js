import express from "express";
import { config as dotenvConfig } from "dotenv";
import AWS from "aws-sdk";
import cors from "cors";
import axios from "axios";

dotenvConfig();

const app = express();
const port = 3000;
// Enable CORS
app.use(cors());

// Set the region for DynamoDB
const region = process.env.AWS_REGION;
AWS.config.update({ region });

// Create DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient();

// Define a function to retrieve data from DynamoDB
const retrieveMostRecentSensorData = async () => {
  return new Promise((resolve, reject) => {
    // Define the parameters for the scan (retrieve all items in the table)
    const params = {
      TableName: "SensorData", // Replace with your table name
    };

    // Scan DynamoDB
    docClient.scan(params, (err, data) => {
      if (err) {
        console.error("Error reading from DynamoDB:", err);
        reject("Internal Server Error");
      } else {
        // Sort data based on sample_time in descending order (most recent first)
        data.Items.sort((a, b) => b.sample_time - a.sample_time);

        // Retrieve only the most recent item
        const mostRecentItem = data.Items.length > 0 ? data.Items[0] : null;

        if (mostRecentItem) {
          // Convert epoch time to a readable format
          const formattedTime = new Date(
            mostRecentItem.sample_time * 1000
          ).toISOString();
          mostRecentItem.sample_time_formatted = formattedTime;

          console.log("Most recent item:", mostRecentItem);

          resolve(mostRecentItem); // Resolve with the most recent item
        } else {
          console.log("No data found");
          reject("No data found");
        }
      }
    });
  });
};

// Define a function to send data to Palm2 API
const sendToPalm2API = async (sensorData) => {
  const palm2ApiUrl = `https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=${process.env.PALM_API_KEY}`;

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const requestBody = {
    prompt: {
      text: `Provide me an action plan based on this sensor data only (sepraate each points by /): ${JSON.stringify(
        sensorData
      )}`,
    },
  };

  return await axios.post(palm2ApiUrl, requestBody, axiosConfig);
};

// Define a new route for Palm2 data
app.get("/palm2-data", async (req, res) => {
  try {
    // Retrieve most recent sensor data
    const mostRecentSensorData = await retrieveMostRecentSensorData();

    // Send the most recent sensor data to Palm2 API
    const palm2ApiResponse = await sendToPalm2API(mostRecentSensorData);

    // You can handle the response from Palm2 API here

    // Send the combined response to the client
    res.json({
      sensorData: mostRecentSensorData,
      palm2ApiResponse: palm2ApiResponse.data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Define a route to manually trigger data retrieval (for testing)
app.get("/sensor-data", async (req, res) => {
  try {
    const mostRecentSensorData = await retrieveMostRecentSensorData();
    res.json(mostRecentSensorData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
