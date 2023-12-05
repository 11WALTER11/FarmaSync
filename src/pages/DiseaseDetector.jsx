import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the root element for accessibility

const DiseaseDetector = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const handleCameraCapture = () => {
    // Implement camera capture logic here
  };

  const handleDetectDisease = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to detect disease");
      }

      const result = await response.json();

      // Set the result and show the modal
      setDiseaseResult(result);
      setModalVisible(true);
    } catch (error) {
      console.error("Error detecting disease:", error.message);
      alert("Error detecting disease. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    // Close the modal and reset the result
    setModalVisible(false);
    setDiseaseResult(null);
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="card p-4">
        <h2 className="text-center mb-4">Disease Detector</h2>
        <form>
          <div className="form-group  p-2">
            <input
              type="file"
              className="form-control-file"
              id="imageInput"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <div className="form-group text-center"></div>
          <div className="form-group text-center">
            <button
              type="button"
              className="btn btn-success mt-3"
              onClick={handleDetectDisease}
              disabled={!selectedImage || loading}
            >
              {loading ? "Detecting..." : "Detect Disease"}
            </button>
          </div>
        </form>

        {/* react-modal */}
        <Modal
          isOpen={modalVisible}
          onRequestClose={closeModal}
          contentLabel="Disease Detected"
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            content: {
              width: "60%",
              margin: "auto",
              padding: "20px",
              borderRadius: "10px",
            },
          }}
        >
          <div>
            <h5>Disease Detected</h5>
            <button onClick={closeModal}>&times;</button>
          </div>
          {selectedImage && (
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontSize: "16px" }}>Uploaded Image:</p>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              <p>
                Plant:{" "}
                <span style={{ fontSize: "18px", color: "red" }}>
                  Tomato Leaf
                </span>
              </p>
              Detected Disease:{" "}
              <span style={{ fontSize: "18px", color: "red" }}>
                {diseaseResult?.class}
              </span>
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DiseaseDetector;
