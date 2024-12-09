import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import GameContainer from "../components/GameContainer";
import { updateFirebaseSingleMovement, updateFirebaseScore } from "../utils/movementUtils";
import GameOverModal from "../components/GameOverModal";
import useSinglePlayerGameSync from "../hooks/useSinglePlayerGameSync";

const SinglePlayerScreen = () => {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [movement, setMovement] = useState(null); // "left" or "right"
  const gameId = "gameId1"; // Example Game ID
  const gameData = useSinglePlayerGameSync(gameId);
  const [fallingObjects, setFallingObjects] = useState([]);
  const [scoredObjects, setScoredObjects] = useState(new Set()); // Track scored objects

  const PLAYER_WIDTH = 30;
  const PLAYER_HEIGHT = 30;
  const FALLING_OBJECT_WIDTH = 50;  // Increased width of falling object
  const FALLING_OBJECT_HEIGHT = 50; // Increased height of falling object

  const screenWidth = Dimensions.get("window").width; // Get screen width
  const gameAreaWidth = 350; // Width of the game area
  const gameAreaHeight = 500; // Height of the game area (for proper collision check)

  const playerSpeed = 5; // Speed at which the player moves
  const groundLevel = gameAreaHeight - PLAYER_HEIGHT; // Y position where the player is located at the bottom

  const playerPositionRef = useRef(gameAreaWidth / 2 - PLAYER_WIDTH / 2); // Player starts at the center
  const groundHitRef = useRef(false); // Prevent multiple triggers for hitting the ground

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedUpdateScore = debounce(updateFirebaseScore, 300);

  // Move falling objects every 100ms (fall speed controlled by score)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        const fallSpeed = score >= 20 ? 15 : 10; // Faster fall speed after score reaches 20
        setFallingObjects((prevObjects) =>
          prevObjects
            .map((obj) => ({
              ...obj,
              positionY: obj.positionY + fallSpeed, // Use variable fall speed
            }))
            .filter((obj) => obj.positionY < gameAreaHeight) // Make sure objects stay within the game area
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameOver, score]); // Depend on score to adjust fall speed dynamically

  // Add new falling objects every second, two objects at a time
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        const newObjects = [
          {
            id: Math.random().toString(),
            positionX: Math.random() * (gameAreaWidth - FALLING_OBJECT_WIDTH), // Random horizontal position for first object
            positionY: 0, // Start at the top
          },
          {
            id: Math.random().toString(),
            positionX: Math.random() * (gameAreaWidth - FALLING_OBJECT_WIDTH), // Random horizontal position for second object
            positionY: 0, // Start at the top
          },
        ];

        setFallingObjects((prevObjects) => [...prevObjects, ...newObjects]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Detect when objects hit the ground, update score, and check for collisions with the player
  useEffect(() => {
    if (!groundHitRef.current) {
      const objectsAtGround = fallingObjects.filter(
        (obj) => obj.positionY + FALLING_OBJECT_HEIGHT >= groundLevel && !scoredObjects.has(obj.id) // Only score objects that haven't been scored yet
      );

      if (objectsAtGround.length > 0) {
        groundHitRef.current = true; // Prevent re-triggering

        // Update score for objects that hit the ground
        setScore((prevScore) => {
          const newScore = prevScore + objectsAtGround.length;
          debouncedUpdateScore(gameId, newScore); // Sync the new score to Firebase
          return newScore;
        });

        // Add scored objects to the scoredObjects set
        setScoredObjects((prevSet) => {
          const newScoredSet = new Set(prevSet);
          objectsAtGround.forEach((obj) => newScoredSet.add(obj.id));
          return newScoredSet;
        });

        // Check for collisions with the player
        objectsAtGround.forEach((obj) => {
          const playerLeft = playerPositionRef.current;
          const playerRight = playerLeft + PLAYER_WIDTH;
          const playerTop = groundLevel - PLAYER_HEIGHT;
          const playerBottom = groundLevel;

          const objectLeft = obj.positionX;
          const objectRight = objectLeft + FALLING_OBJECT_WIDTH;
          const objectTop = obj.positionY;
          const objectBottom = objectTop + FALLING_OBJECT_HEIGHT;

          // Check for collision with enlarged object hitbox
          if (
            playerLeft < objectRight &&
            playerRight > objectLeft &&
            playerTop < objectBottom &&
            playerBottom > objectTop
          ) {
            setGameOver(true); // End the game if the player is hit
          }
        });

        // Remove obstacles that have hit the ground or gone past the game area
        setFallingObjects((prevObjects) =>
          prevObjects.filter((obj) => obj.positionY + FALLING_OBJECT_HEIGHT < gameAreaHeight)
        );

        setTimeout(() => (groundHitRef.current = false), 50); // Reset after a short delay
      }
    }
  }, [fallingObjects, scoredObjects]);

  // Handle movement changes (left or right)
  const onButtonPress = (direction) => {
    setMovement(direction);
    updateFirebaseSingleMovement(gameId, direction, score); // Update movement in Firebase
  };

  const onRestart = () => {
    setGameOver(false);
    setScore(0);
    setFallingObjects([]); // Clear falling objects
    setScoredObjects(new Set()); // Reset scored objects
    playerPositionRef.current = gameAreaWidth / 2 - PLAYER_WIDTH / 2; // Reset to center
  };

  // Continuous player movement while holding button
  useEffect(() => {
    if (movement) {
      const moveInterval = setInterval(() => {
        movePlayer(movement);
      }, 1000 / 60); // 60 FPS

      return () => clearInterval(moveInterval);
    }
  }, [movement]);

  // Single tap movement
  const onTapMovement = (direction) => {
    movePlayer(direction);
  };

  const movePlayer = (direction) => {
    if (direction === "left") {
      playerPositionRef.current = Math.max(playerPositionRef.current - playerSpeed, 0); // Prevent going out of bounds
    } else if (direction === "right") {
      playerPositionRef.current = Math.min(playerPositionRef.current + playerSpeed, gameAreaWidth - PLAYER_WIDTH); // Prevent going out of bounds
    }
  };

  const gameArea = (
    <View style={styles.gameArea}>
      <View
        style={[styles.player, { left: playerPositionRef.current }]} // Set dynamic position from ref
      >
        <Text style={styles.playerText}>P</Text>
      </View>

      {fallingObjects.map((obj) => (
        <View
          key={obj.id}
          style={[styles.fallingObject, { left: obj.positionX, top: obj.positionY }]}/>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <GameContainer
        gameOver={gameOver}
        onRestart={onRestart}
        highScore={gameData.highScore || 0}
        gameArea={gameArea}
      />

      <View style={[styles.scoreContainer, { left: (screenWidth - 200) / 2 }]}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => onButtonPress("left")}
          onPressOut={() => setMovement(null)}
          onPress={() => onTapMovement("left")}
        >
          <Text style={styles.controlButtonText}>Left</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => onButtonPress("right")}
          onPressOut={() => setMovement(null)}
          onPress={() => onTapMovement("right")}
        >
          <Text style={styles.controlButtonText}>Right</Text>
        </TouchableOpacity>
      </View>

      <GameOverModal gameOver={gameOver} onRestart={onRestart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  gameArea: {
    position: "relative",
    width: 350,
    height: 500,
    backgroundColor: "#222",
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  player: {
    position: "absolute",
    bottom: 5,
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
    width: 50,  // Increased size
    height: 50, // Increased size
    backgroundColor: "red",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#222",
  },
  controlButton: {
    width: 100,
    height: 40,
    padding: 10,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  scoreContainer: {
    position: "absolute",
    top: 10,
    zIndex: 1,
  },
  scoreText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default SinglePlayerScreen;

