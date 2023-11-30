import express from "express";
import { config as dotenvConfig } from "dotenv";
import AWS from "aws-sdk";
import cors from "cors";

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
const retrieveMostRecentSensorData = (res) => {
  // Define the parameters for the scan (retrieve all items in the table)
  const params = {
    TableName: "SensorData", // Replace with your table name
  };

  // Scan DynamoDB
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Error reading from DynamoDB:", err);
      res.status(500).send("Internal Server Error");
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
        res.json(mostRecentItem); // Send the most recent item as a JSON response
      } else {
        console.log("No data found");
        res.status(404).send("No data found");
      }
    }
  });
};

// Define a route to manually trigger data retrieval (for testing)
app.get("/sensor-data/", (req, res) => {
  retrieveMostRecentSensorData(res);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
