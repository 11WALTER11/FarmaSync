import React, { useEffect, useState } from "react";
import axios from "axios";

const Stats = () => {
  const [statsData, setStatsData] = useState([]);
  const [nutrientChanges, setNutrientChanges] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sensor data
        const sensorDataResponse = await axios.get(
          "http://localhost:3000/sensor-data/"
        );
        setStatsData(sensorDataResponse.data);
        console.log("Sensor data fetched:", sensorDataResponse.data);

        // Fetch nutrient changes only if it's not already fetched
        if (Object.keys(nutrientChanges).length === 0) {
          const nutrientChangesResponse = await axios.get(
            "http://localhost:3000/nutrient-changes/"
          );
          setNutrientChanges(nutrientChangesResponse.data);
          console.log(
            "Nutrient changes fetched:",
            nutrientChangesResponse.data
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Fetch data initially
    fetchData();

    // Schedule fetching data every 20 seconds
    const intervalId = setInterval(fetchData, 20000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs only once

  // Check if statsData is empty before trying to access its properties
  if (statsData.length === 0 || Object.keys(nutrientChanges).length === 0) {
    return null; // or render a loading state, or an error message
  }

  // Check if statsData is empty before trying to access its properties
  if (statsData.length === 0 || Object.keys(nutrientChanges).length === 0) {
    return null; // or render a loading state, or an error message
  }

  const dataItem = statsData[0];

  const createNutrientCard = (nutrient, iconClass, changePercentage) => (
    <div className="col-xl-3 col-lg-6" key={nutrient}>
      <div className="card card-stats mb-4 mb-xl-0">
        <div className="card-body">
          <div className="row">
            <div className="col">
              <h5 className="card-title text-uppercase text-muted mb-0">
                {nutrient} Level
              </h5>
              <span className="h2 font-weight-bold mb-0">
                {statsData.device_data[nutrient.toLowerCase()]} %
              </span>
            </div>
            <div className="col-2">
              <div className={`col-auto icon icon-shape ${iconClass}`}>
                <i className="fas fa-chart-bar" />
              </div>
            </div>
          </div>
          <p className="mt-3 mb-0 text-muted text-sm">
            <span
              className={`mr-2 ${
                changePercentage > 0 ? "text-success" : "text-danger"
              }`}
            >
              <i
                className={`fa ${
                  changePercentage > 0 ? "fa-arrow-up" : "fa-arrow-down"
                }`}
              />{" "}
              {Math.abs(changePercentage).toFixed(2)}%
            </span>{" "}
            <span className="text-nowrap">Since last month</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="container">
        <div className="main-content">
          <div className="header bg-gradient-primary">
            <div className="container-fluid">
              <h2 className="mb-5 text-white">Stats Card</h2>
              <div className="header-body">
                <div className="row">
                  {Object.entries(nutrientChanges.percentageChanges).map(
                    ([nutrient, changePercentage]) =>
                      createNutrientCard(
                        nutrient,
                        "text-danger",
                        parseFloat(changePercentage)
                      )
                  )}
                  {/* Other cards remain the same */}
                </div>
              </div>
            </div>
          </div>
          {/* Page content */}
        </div>
      </div>
    </>
  );
};

export default Stats;
