import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import Webcam from "react-webcam";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  maxWidth: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  border: "none",
};

const webcamModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  textAlign: "center",
};

const DiseaseDetector = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const webcamRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setSelectedImageUrl(URL.createObjectURL(file));
  };

  const handleCaptureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "webcam_image.png", {
            type: "image/png",
          });
          setSelectedImage(file);
          setSelectedImageUrl(URL.createObjectURL(blob));
          setWebcamOpen(false);
        });
    }
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
    setModalVisible(false);
    setDiseaseResult(null);
  };

  const toggleWebcam = () => {
    setWebcamOpen(!webcamOpen);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h4" align="center" gutterBottom>
                Disease Detector
              </Typography>
              <Box textAlign="center">
                <label htmlFor="upload-image">
                  <input
                    id="upload-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <Button
                    component="span"
                    variant="contained"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                  </Button>
                </label>
              </Box>
              {selectedImageUrl && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Image
                  </Typography>
                  <img
                    src={selectedImageUrl}
                    alt="Selected"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                    }}
                  />
                </Paper>
              )}
              <Box textAlign="center">
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleDetectDisease}
                  disabled={!selectedImage || loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Detect Disease"}
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={webcamOpen} onClose={toggleWebcam}>
        <Box sx={webcamModalStyle}>
          <Typography variant="h5" gutterBottom>
            Capture Image from Webcam
          </Typography>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            width="100%"
            style={{
              borderRadius: "8px",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleCaptureFromWebcam}
          >
            Capture
          </Button>
        </Box>
      </Modal>

      <Modal open={modalVisible} onClose={closeModal}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">Disease Detected</Typography>
            <IconButton onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          {selectedImageUrl && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                textAlign: "center",
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Uploaded Image
              </Typography>
              <img
                src={selectedImageUrl}
                alt="Uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                }}
              />
            </Paper>
          )}
          <Box>
            <Typography variant="h6">
              Plant: <span style={{ color: "red" }}>Tomato Leaf</span>
            </Typography>
            <Typography variant="h6">
              Detected Disease:{" "}
              <span style={{ color: "red" }}>{diseaseResult?.class}</span>
            </Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DiseaseDetector;
