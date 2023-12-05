import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-light shadow fixed">
      <div className="container-fluid">
        <Link to="/">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img
              src={"/logo.png"}
              alt="FarmaSync Logo"
              width="80"
              height="50"
              className="d-inline-block align-top"
            />
            <span className="ms-0">FarmaSync- Data Driven Farming</span>
          </a>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mynavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mynavbar">
          {/* Navigation links */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/DiseaseDetector">
                <a className="nav-link" href="#">
                  Disease Detector
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
