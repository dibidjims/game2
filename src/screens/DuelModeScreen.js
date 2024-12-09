import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import GameContainer from "../components/GameContainer";
import { updateFirebaseDuelMovement } from "../utils/movementUtils";
import useDuelGameSync from "../hooks/useDuelGameSync";

const DuelModeScreen = () => {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [movement, setMovement] = useState({ player1: "right", player2: "left" });
  const gameId = "gameId1"; // Example Game ID
  const gameData = useDuelGameSync(gameId);

  const onButtonPress = (player, newMovement) => {
    setMovement((prev) => ({ ...prev, [player]: newMovement }));
    updateFirebaseDuelMovement(gameId, player, newMovement, score[player]);
  };

  const onRestart = () => {
    setGameOver(false);
    setScore({ player1: 0, player2: 0 });
  };

  // Game area with the players and falling objects
  const gameArea = (
    <View style={styles.gameArea}>
      {/* Player 1 */}
      <View
        style={[
          styles.player,
          { left: movement.player1 === "right" ? 100 : 50 },
        ]}
      >
        <Text style={styles.playerText}>P1</Text>
      </View>

      {/* Player 2 */}
      <View
        style={[
          styles.player,
          { left: movement.player2 === "left" ? 300 : 350 },
        ]}
      >
        <Text style={styles.playerText}>P2</Text>
      </View>

      {/* Falling Objects */}
      {gameData.fallingObjects.map((obj) => (
        <View
          key={obj.id}
          style={[
            styles.fallingObject,
            { left: obj.positionX, top: obj.positionY },
          ]}
        />
      ))}
    </View>
  );

  return (
    <GameContainer
      gameOver={gameOver}
      onRestart={onRestart}
      highScore={Math.max(score.player1, score.player2)}
      onButtonPress={onButtonPress}
      gameArea={gameArea}
    />
  );
};

const styles = StyleSheet.create({
  gameArea: {
    position: "relative",
    width: "100%",
    height: 500, // Adjust the height of the game area
    backgroundColor: "#000",
  },
  player: {
    position: "absolute",
    bottom: 0,
    width: 30,
    height: 30,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
  },
  playerText: {
    color: "#fff",
    fontSize: 14,
  },
  fallingObject: {
    position: "absolute",
    width: 30,
    height: 30,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DuelModeScreen;
