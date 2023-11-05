import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
      <div className="container-fluid">
        <Link to="/">
          <a className="navbar-brand" href="#">
            FarmaSync- Data Driven Farming
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
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="languageDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Select Language
              </a>
              <ul className="dropdown-menu" aria-labelledby="languageDropdown">
                <li>
                  <a className="dropdown-item" href="#">
                    English
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Español
                  </a>
                </li>
                {/* Add more language options as needed */}
              </ul>
            </li>
            <li className="nav-item">
              <Link to="AboutUs">
                <a className="nav-link" href="#">
                  About us
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
