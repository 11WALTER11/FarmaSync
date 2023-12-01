import React, { useState, useEffect } from "react";
import axios from "axios";

const ActionPlan = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/palm2-data");
      const palm2Data = response.data.palm2ApiResponse;
      setData(palm2Data);
    } catch (error) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures useEffect runs only once on component mount

  const handleGenerateNewResults = () => {
    setLoading(true);
    fetchData();
  };

  return (
    <>
      <div className="container d-flex justify-content-start p-4">
        <div className="bg-light col-12" style={{ height: "400px" }}>
          <h3 className="text-center">Action Plan</h3>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {data && (
            <>
              <ul>
                {/* Display each action as a separate list item */}
                {data.candidates[0].output.split(". ").map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
              <button onClick={handleGenerateNewResults}>
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
