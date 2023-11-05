import React from "react";

const DiseaseDetector = () => {
  const handleImageUpload = (event) => {
    // Handle the image upload logic here
  };

  const handleCameraCapture = () => {
    // Handle the camera capture logic here
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="card p-4">
        <h2 className="text-center mb-4">Disease Detector</h2>
        <form>
          <div className="form-group">
            <label htmlFor="imageInput">Import Image</label>
            <input
              type="file"
              className="form-control-file"
              id="imageInput"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <div className="form-group text-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCameraCapture}
            >
              Capture from Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiseaseDetector;
