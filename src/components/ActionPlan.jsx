import React, { useState, useEffect } from "react";
import axios from "axios";
import ContentLoader from "react-loading-placeholder";

const ActionPlan = () => {
  const [sensorData, setSensorData] = useState(null);
  const [actionPlan, setActionPlan] = useState("");
  const [loading, setLoading] = useState(true);
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
    fetchData();
  };

  return (
    <>
      <div className="container d-flex justify-content-start p-4 ">
        <div
          className="bg-light col-12 shadow p-4 "
          style={{ height: "auto", whiteSpace: "pre-line" }}
        >
          <h3 className="text-center p-2">Action Plan</h3>{" "}
          {loading && (
            <ContentLoader
              isLoading={loading}
              backgroundColor="#f5f5f5"
              foregroundColor="#dbdbdb"
            >
              <p>Loading...</p>
            </ContentLoader>
          )}
          {error && <p>Error: {error}</p>}
          {sensorData && (
            <>
              {/* Display the sensor data */}
              <p>{JSON.stringify(sensorData.actionPlan, null, 2)}</p>
            </>
          )}
          {actionPlan && (
            <>
              {/* Display the action plan with preserved line breaks */}
              <p className="mx-2">{actionPlan}</p>
              <button
                onClick={handleGenerateNewResults}
                className="text-white bg-dark btn btn-sm "
              >
                Generate New Results
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ActionPlan;
