import express from "express";
import { config as dotenvConfig } from "dotenv";
import AWS from "aws-sdk";
import cors from "cors";
import OpenAI from "openai";
import bodyParser from "body-parser";

dotenvConfig();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// AWS Configuration
const region = process.env.AWS_REGION;
AWS.config.update({ region });
const docClient = new AWS.DynamoDB.DocumentClient();

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Functions

const generatePrompt = (sensorData, historicalData) => {
  const { sample_time_formatted, device_data } = sensorData;
  const { humidity, potassium, soil_moisture, nitrogen, phosphorus } =
    device_data;

  const pastAverage = calculateHistoricalAverage(historicalData);

  const prompt = `Provide a practical action plan for the farmer based on the most recent and historical sensor data:\n
    - Sample Time: ${sample_time_formatted}
    - Humidity: ${humidity}%
    - Potassium Level: ${potassium}%
    - Soil Moisture: ${soil_moisture}%
    - Nitrogen Level: ${nitrogen}%
    - Phosphorus Level: ${phosphorus}%
    
    Historical Data (Averaged):
    - Avg Humidity: ${pastAverage.humidity}%
    - Avg Potassium Level: ${pastAverage.potassium}%
    - Avg Soil Moisture: ${pastAverage.soil_moisture}%
    - Avg Nitrogen Level: ${pastAverage.nitrogen}%
    - Avg Phosphorus Level: ${pastAverage.phosphorus}%

    Suggest specific actions to optimize crop growth and yield. Please avoid including any extraneous or unnecessary information. You have to talk in the first person to the farmer and suggest what to do in an easy way.`;

  return prompt;
};

const calculateHistoricalAverage = (historicalData) => {
  if (!historicalData || historicalData.length === 0) {
    return {
      humidity: 0,
      potassium: 0,
      soil_moisture: 0,
      nitrogen: 0,
      phosphorus: 0,
    };
  }

  const totalItems = historicalData.length;
  const sum = historicalData.reduce(
    (acc, data) => {
      const { humidity, potassium, soil_moisture, nitrogen, phosphorus } =
        data.device_data;
      acc.humidity += humidity;
      acc.potassium += potassium;
      acc.soil_moisture += soil_moisture;
      acc.nitrogen += nitrogen;
      acc.phosphorus += phosphorus;
      return acc;
    },
    {
      humidity: 0,
      potassium: 0,
      soil_moisture: 0,
      nitrogen: 0,
      phosphorus: 0,
    }
  );

  return {
    humidity: (sum.humidity / totalItems).toFixed(2),
    potassium: (sum.potassium / totalItems).toFixed(2),
    soil_moisture: (sum.soil_moisture / totalItems).toFixed(2),
    nitrogen: (sum.nitrogen / totalItems).toFixed(2),
    phosphorus: (sum.phosphorus / totalItems).toFixed(2),
  };
};

const calculatePercentageChanges = (mostRecentData, historicalData) => {
  if (!historicalData || historicalData.length === 0) {
    return {
      humidity: 0,
      potassium: 0,
      soil_moisture: 0,
      nitrogen: 0,
      phosphorus: 0,
    };
  }

  const mostRecentValues = mostRecentData.device_data;

  const historicalAverage = calculateHistoricalAverage(historicalData);

  return {
    humidity: calculatePercentageChange(
      mostRecentValues.humidity,
      historicalAverage.humidity
    ),
    potassium: calculatePercentageChange(
      mostRecentValues.potassium,
      historicalAverage.potassium
    ),
    soil_moisture: calculatePercentageChange(
      mostRecentValues.soil_moisture,
      historicalAverage.soil_moisture
    ),
    nitrogen: calculatePercentageChange(
      mostRecentValues.nitrogen,
      historicalAverage.nitrogen
    ),
    phosphorus: calculatePercentageChange(
      mostRecentValues.phosphorus,
      historicalAverage.phosphorus
    ),
  };
};

const calculatePercentageChange = (currentValue, historicalAverage) => {
  return (
    ((currentValue - historicalAverage) / historicalAverage) *
    100
  ).toFixed(2);
};

const sendToChatGPT = async (sensorData, historicalData) => {
  try {
    const prompt = generatePrompt(sensorData, historicalData);

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

const retrieveHistoricalSensorData = () => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: "SensorData",
    };

    docClient.scan(params, (err, data) => {
      if (err) {
        console.error("Error reading historical data from DynamoDB:", err);
        reject("Internal Server Error");
      } else {
        resolve(data.Items);
      }
    });
  });
};
const sendToChatGPTForTranslation = async (englishText) => {
  try {
    const prompt = "Translate the following English text to Hindi:";

    // Set max_tokens to a very high value (use with caution)
    const maxTokens = 4096;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: englishText },
      ],
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error translating text with ChatGPT:", error);
    throw error;
  }
};

app.get("/chatgpt-data", async (req, res) => {
  try {
    const mostRecentSensorData = await retrieveMostRecentSensorData();
    const historicalSensorData = await retrieveHistoricalSensorData();
    const chatGPTResponse = await sendToChatGPT(
      mostRecentSensorData,
      historicalSensorData
    );

    res.json({
      sensorData: mostRecentSensorData,
      actionPlan: chatGPTResponse,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/sensor-data", async (req, res) => {
  try {
    const mostRecentSensorData = await retrieveMostRecentSensorData();
    res.json(mostRecentSensorData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// endpoint to calculate and send percentage changes
app.get("/nutrient-changes", async (req, res) => {
  try {
    const mostRecentSensorData = await retrieveMostRecentSensorData();
    const historicalSensorData = await retrieveHistoricalSensorData();

    const percentageChanges = calculatePercentageChanges(
      mostRecentSensorData,
      historicalSensorData
    );

    res.json({
      percentageChanges,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/translate-to-hindi-chatgpt", async (req, res) => {
  try {
    const { englishText } = req.body;

    // Use ChatGPT for translation
    const hindiTranslation = await sendToChatGPTForTranslation(englishText);

    res.json({ hindiText: hindiTranslation });
  } catch (error) {
    console.error("Error translating text with ChatGPT:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
