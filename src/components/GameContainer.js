import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";

const GameContainer = ({
  gameOver,
  onRestart,
  highScore,
  gameArea,
}) => {
  return (
    <View style={styles.gameContainer}>
      {gameArea} {/* The game area passed as a prop */}
    </View>
  );
};

const styles = StyleSheet.create({
  gameContainer: {
    marginTop: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  scoreText: {
    color: "#fff",
    fontSize: 20,
    alignContent: "center",
  },
  gameOverText: {
    color: "#ff0000",
    fontSize: 30,
    position: "absolute",
    top: "40%",
  },
  restartText: {
    color: "#fff",
    fontSize: 18,
    position: "absolute",
    bottom: "10%",
  },
});

export default GameContainer;
