import express from "express";
import { config as dotenvConfig } from "dotenv";
import AWS from "aws-sdk";
import cors from "cors";
import OpenAI from "openai";

dotenvConfig();

const app = express();
const port = 3000;

// Middleware
app.use(cors());

// AWS Configuration
const region = process.env.AWS_REGION;
AWS.config.update({ region });
const docClient = new AWS.DynamoDB.DocumentClient();

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Functions

const generatePrompt = (sensorData) => {
  const { sample_time_formatted, device_data } = sensorData;
  const { humidity, potassium, soil_moisture, nitrogen, phosphorus } =
    device_data;

  const prompt = `Provide a practical action plan for the farmer based on the most recent sensor data:\n
    - Sample Time: ${sample_time_formatted}
    - Humidity: ${humidity}%
    - Potassium Level: ${potassium}%
    - Soil Moisture: ${soil_moisture}%
    - Nitrogen Level: ${nitrogen}%
    - Phosphorus Level: ${phosphorus}%\n
    Suggest specific actions to optimize crop growth and yield. Please avoid including any extraneous or unnecessary information. you have to talk in first person to farmer and suggest what to do in easy way`;

  return prompt;
};

const sendToChatGPT = async (sensorData) => {
  try {
    const prompt = generatePrompt(sensorData);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error running ChatGPT:", error);
    throw error;
  }
};

const retrieveMostRecentSensorData = () => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: "SensorData",
    };

    docClient.scan(params, (err, data) => {
      if (err) {
        console.error("Error reading from DynamoDB:", err);
        reject("Internal Server Error");
      } else {
        data.Items.sort((a, b) => b.sample_time - a.sample_time);
        const mostRecentItem = data.Items.length > 0 ? data.Items[0] : null;

        if (mostRecentItem) {
          const formattedTime = new Date(
            mostRecentItem.sample_time * 1000
          ).toISOString();
          mostRecentItem.sample_time_formatted = formattedTime;

          console.log("Most recent item:", mostRecentItem);

          resolve(mostRecentItem);
        } else {
          console.log("No data found");
          reject("No data found");
        }
      }
    });
  });
};

// Routes

app.get("/chatgpt-data", async (req, res) => {
  try {
    const mostRecentSensorData = await retrieveMostRecentSensorData();
    const chatGPTResponse = await sendToChatGPT(mostRecentSensorData);

    res.json({
      sensorData: mostRecentSensorData,
      actionPlan: chatGPTResponse,
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
