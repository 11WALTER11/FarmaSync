import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ActionPlan = () => {
  const [sensorData, setSensorData] = useState(null);
  const [actionPlan, setActionPlan] = useState("");
  const [translatedActionPlan, setTranslatedActionPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/chatgpt-data");
      const chatGPTData = response.data;

      // Destructuring the response data
      const { sensorData, actionPlan } = chatGPTData;

      setSensorData(sensorData);
      setActionPlan(actionPlan);
    } catch (error) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data only during the initial render
    if (!sensorData && !actionPlan) {
      fetchData();
    }
  }, []);

  const handleGenerateNewResults = () => {
    setLoading(true);
    setSensorData(null);
    setActionPlan(null);
    setTranslatedActionPlan(""); // Reset translated text
    fetchData();
  };

  const translateToHindiChatGPT = async () => {
    try {
      setTranslating(true);

      const response = await axios.post(
        "http://localhost:3000/translate-to-hindi-chatgpt",
        {
          englishText: actionPlan,
        }
      );

      // Set the translated text in state
      setTranslatedActionPlan(response.data.hindiText);

      // Clear the original action plan to hide it
      setActionPlan(null);
    } catch (error) {
      console.error("Error translating to Hindi with ChatGPT:", error);
    } finally {
      // Show the "Generate New Results" button and stop translating
      setTranslating(false);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container d-flex justify-content-start p-4 ">
        <div
          className="bg-light col-12 shadow p-4 "
          style={{ height: "auto", whiteSpace: "pre-line" }}
        >
          <h3 className="text-center p-2">Action Plan</h3>{" "}
          {loading && <Skeleton count={10} />}
          {error && <p>Error: {error}</p>}
          {sensorData && (
            <>
              {/* Display the sensor data */}
              <p>{JSON.stringify(sensorData.actionPlan, null, 2)}</p>
            </>
          )}
          {!translatedActionPlan && !translating && (
            <>
              {/* Display the action plan with preserved line breaks */}
              <p className="mx-2">{actionPlan}</p>
              <button
                onClick={handleGenerateNewResults}
                className="text-white bg-dark btn btn-sm me-2"
              >
                Generate New Results
              </button>
              <button
                onClick={translateToHindiChatGPT}
                className="text-white bg-primary btn btn-sm ml-2"
              >
                Translate to Hindi (ChatGPT)
              </button>
            </>
          )}
          {translating && (
            <div className="text-center mt-2">
              <p>Translating to Hindi...</p>
            </div>
          )}
          {translatedActionPlan && !translating && (
            <div className="mt-2 ">
              <p className="mx-2 ">{translatedActionPlan}</p>
              <button
                onClick={handleGenerateNewResults}
                className="text-white bg-dark btn btn-sm"
              >
                नए परिणाम उत्पन्न करें
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActionPlan;
