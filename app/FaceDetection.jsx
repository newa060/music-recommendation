import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Button } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width, height } = Dimensions.get('window');

export default function FaceTestScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  // Simulate face detection
  useEffect(() => {
    let detectionInterval;
    
    if (permission?.granted) {
      detectionInterval = setInterval(() => {
        // Simulate face detection - 80% chance face is detected
        const faceDetected = Math.random() > 0.2;
        setIsFaceDetected(faceDetected);
      }, 1500);
    }
    
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Loading permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>We need your permission to use the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="front"
      />

      {/* Face detection overlay */}
      <View style={styles.faceGuide}>
        <View style={[
          styles.faceCircle, 
          isFaceDetected ? styles.faceCircleActive : styles.faceCircleInactive
        ]} />
        <Text style={styles.guideText}>
          {isFaceDetected ? "Face detected! ✓" : "Position your face in the circle"}
        </Text>
      </View>

      <View style={styles.statusOverlay}>
        <Text style={isFaceDetected ? styles.detectedText : styles.notDetectedText}>
          {isFaceDetected ? " Face Detected!" : "No Face Detected "}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  camera: { 
    flex: 1 
  },
  faceGuide: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    alignItems: 'center',
  },
  faceCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  faceCircleActive: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  faceCircleInactive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  guideText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  statusOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  detectedText: { 
    color: "#4CAF50", 
    fontSize: 22, 
    textAlign: "center",
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  notDetectedText: { 
    color: "#FF9800", 
    fontSize: 22, 
    textAlign: "center",
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },
});