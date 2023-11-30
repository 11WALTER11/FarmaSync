import React, { useEffect, useState } from "react";
import axios from "axios";

const Stats = () => {
  const [statsData, setstatsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/sensor-data/");
        setstatsData(response.data);
        console.log("Sensor data fetched:", response.data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    // Fetch data initially
    fetchData();

    // Schedule fetching data every 20 seconds
    const intervalId = setInterval(fetchData, 4000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Check if statsData is empty before trying to access its properties
  if (statsData.length === 0) {
    return null; // or render a loading state, or an error message
  }

  const dataItem = statsData[0];
  return (
    <>
      <div className="container">
        <div className="main-content">
          <div className="header bg-gradient-primary">
            <div className="container-fluid">
              <h2 className="mb-5 text-white">Stats Card</h2>
              <div className="header-body">
                <div className="row">
                  <div className="col-xl-3 col-lg-6">
                    <div className="card card-stats mb-4 mb-xl-0">
                      <div className="card-body">
                        <div className="row">
                          <div className="col">
                            <h5 className="card-title text-uppercase text-muted mb-0">
                              Mositure Level
                            </h5>
                            <span className="h2 font-weight-bold mb-0">
                              {" "}
                              {statsData &&
                                statsData.device_data &&
                                statsData.device_data.soil_moisture}{" "}
                              %
                            </span>
                          </div>
                          <div className="col-2">
                            <div className="col-auto icon icon-shape  text-danger ">
                              <i className="fas fa-chart-bar" />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 mb-0 text-muted text-sm">
                          <span className="text-success mr-2">
                            <i className="fa fa-arrow-up" /> 3.48%
                          </span>{" "}
                          <span className="text-nowrap">Since last month</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6">
                    <div className="card card-stats mb-4 mb-xl-0">
                      <div className="card-body">
                        <div className="row">
                          <div className="col">
                            <h5 className="card-title text-uppercase text-muted mb-0">
                              Potassium Level
                            </h5>
                            <span className="h2 font-weight-bold mb-0">
                              {statsData &&
                                statsData.device_data &&
                                statsData.device_data.potassium}{" "}
                              %
                            </span>
                          </div>
                          <div className="col-2">
                            <div className="col-auto icon icon-shape  text-warning">
                              <i className="fas fa-chart-pie" />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 mb-0 text-muted text-sm">
                          <span className="text-danger mr-2">
                            <i className="fas fa-arrow-down" /> 3.48%
                          </span>{" "}
                          <span className="text-nowrap">Since last week</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6">
                    <div className="card card-stats mb-4 mb-xl-0">
                      <div className="card-body">
                        <div className="row">
                          <div className="col">
                            <h5 className="card-title text-uppercase text-muted mb-0">
                              Nitrogen Level
                            </h5>
                            <span className="h2 font-weight-bold mb-0">
                              {statsData &&
                                statsData.device_data &&
                                statsData.device_data.nitrogen}{" "}
                              %
                            </span>
                          </div>
                          <div className="col-auto">
                            <div className="col-auto icon icon-shape  text-warning">
                              <i className="fas fa-users" />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 mb-0 text-muted text-sm">
                          <span className="text-warning mr-2">
                            <i className="fas fa-arrow-down" /> 1.10%
                          </span>{" "}
                          <span className="text-nowrap">Since yesterday</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6">
                    <div className="card card-stats mb-4 mb-xl-0">
                      <div className="card-body">
                        <div className="row">
                          <div className="col">
                            <h5 className="card-title text-uppercase text-muted mb-0">
                              Phosphorus Level
                            </h5>
                            <span className="h2 font-weight-bold mb-0">
                              {statsData &&
                                statsData.device_data &&
                                statsData.device_data.phosphorus}{" "}
                              %
                            </span>
                          </div>
                          <div className="col-auto">
                            <div className="col-auto icon icon-shape  text-success">
                              <i className="fas fa-percent" />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 mb-0 text-muted text-sm">
                          <span className="text-success mr-2">
                            <i className="fas fa-arrow-up" /> 12%
                          </span>{" "}
                          <span className="text-nowrap">Since last month</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-6 mt-4">
                    <div className="card card-stats mb-4 mb-xl-0">
                      <div className="card-body">
                        <div className="row">
                          <div className="col">
                            <h5 className="card-title text-uppercase text-muted mb-0">
                              Humidity Level
                            </h5>
                            <span className="h2 font-weight-bold mb-0">
                              {statsData &&
                                statsData.device_data &&
                                statsData.device_data.humidity}{" "}
                              %
                            </span>
                          </div>
                          <div className="col-auto">
                            <div className="col-auto icon icon-shape  text-success">
                              <i className="fas fa-percent" />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 mb-0 text-muted text-sm">
                          <span className="text-success mr-2">
                            <i className="fas fa-arrow-up" /> 17%
                          </span>{" "}
                          <span className="text-nowrap">Since last month</span>
                        </p>
                      </div>
                    </div>
                  </div>
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
