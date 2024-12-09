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
      <Text style={styles.scoreText}>High Score: {highScore}</Text>
      <Text style={styles.gameOverText}>{gameOver ? "Game Over!" : ""}</Text>
      <Text style={styles.restartText} onPress={onRestart}>
        {gameOver ? "Tap to Restart" : ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  gameContainer: {
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
