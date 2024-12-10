import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PauseModal = ({ visible, onResume, onRestart, onMainMenu }) => {
  if (!visible) return null; // If not visible, return nothing

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modal}>
        <Text style={styles.modalText}>Game Paused</Text>
        <TouchableOpacity onPress={onResume} style={styles.button}>
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRestart} style={styles.button}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMainMenu} style={styles.button}>
          <Text style={styles.buttonText}>Main Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    width: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default PauseModal;
