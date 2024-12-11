import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation for navigation
import GameContainer from "../components/GameContainer";
import {
  updateFirebaseMovement,
  updateFirebaseScore,
  updateFirebaseLives,
} from "../utils/movementUtils";
import GameOverModal from "../components/GameOverModal";
import PauseModal from "../components/PauseModal";
import useSinglePlayerGameSync from "../hooks/useSinglePlayerGameSync";

const LivesDisplay = ({ lives }) => {
  return (
    <View style={styles.livesContainer}>
      {[1, 2, 3].map((index) => (
        <View
          key={index}
          style={[
            styles.lifeCircle,
            { backgroundColor: index <= lives ? "green" : "gray" },
          ]}
        />
      ))}
    </View>
  );
};

const SinglePlayerScreen = () => {
  const navigation = useNavigation(); // Use useNavigation hook for navigation
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [movement, setMovement] = useState(null);
  const gameId = "gameId1";
  const gameData = useSinglePlayerGameSync(gameId);
  const [fallingObjects, setFallingObjects] = useState([]);
  const [scoredObjects, setScoredObjects] = useState(new Set());

  const PLAYER_WIDTH = 30;
  const PLAYER_HEIGHT = 30;
  const FALLING_OBJECT_WIDTH = 50;
  const FALLING_OBJECT_HEIGHT = 50;

  const screenWidth = Dimensions.get("window").width;
  const gameAreaWidth = 350;
  const gameAreaHeight = 500;

  const playerSpeed = 5;
  const groundLevel = gameAreaHeight - PLAYER_HEIGHT;

  const playerPositionRef = useRef(gameAreaWidth / 2 - PLAYER_WIDTH / 2);
  const groundHitRef = useRef(false);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedUpdateScore = debounce(updateFirebaseScore, 300);
  const debouncedUpdateLives = debounce(updateFirebaseLives, 300);

  const getHit = () => {
    setLives((prevLives) => {
      const newLives = prevLives - 1;
      debouncedUpdateLives(gameId, newLives);
      if (newLives <= 0) {
        setGameOver(true);
      }
      return newLives;
    });
  };

  useEffect(() => {
    if (gameData.lives !== undefined) {
      setLives(gameData.lives);
    }
  }, [gameData.lives]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !paused) {
        const fallSpeed = score >= 2000 ? 15 : 10;
        setFallingObjects((prevObjects) =>
          prevObjects
            .map((obj) => ({
              ...obj,
              positionY: obj.positionY + fallSpeed,
            }))
            .filter((obj) => obj.positionY < gameAreaHeight)
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameOver, paused, score]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !paused) {
        const newObjects = [
          {
            id: Math.random().toString(),
            positionX: Math.random() * (gameAreaWidth - FALLING_OBJECT_WIDTH),
            positionY: 0,
          },
          {
            id: Math.random().toString(),
            positionX: Math.random() * (gameAreaWidth - FALLING_OBJECT_WIDTH),
            positionY: 0,
          },
        ];

        setFallingObjects((prevObjects) => [...prevObjects, ...newObjects]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver, paused]);

  useEffect(() => {
    if (!groundHitRef.current) {
      const objectsAtGround = fallingObjects.filter(
        (obj) => obj.positionY + FALLING_OBJECT_HEIGHT >= groundLevel && !scoredObjects.has(obj.id)
      );

      if (objectsAtGround.length > 0) {
        groundHitRef.current = true;

        setScore((prevScore) => {
          const newScore = prevScore + objectsAtGround.length * 50;
          debouncedUpdateScore(gameId, newScore);
          return newScore;
        });

        setScoredObjects((prevSet) => {
          const newSet = new Set(prevSet);
          objectsAtGround.forEach((obj) => newSet.add(obj.id));
          return newSet;
        });

        objectsAtGround.forEach((obj) => {
          const playerLeft = playerPositionRef.current;
          const playerRight = playerLeft + PLAYER_WIDTH;
          const playerTop = groundLevel - PLAYER_HEIGHT;
          const playerBottom = groundLevel;

          const objectLeft = obj.positionX;
          const objectRight = objectLeft + FALLING_OBJECT_WIDTH;
          const objectTop = obj.positionY;
          const objectBottom = objectTop + FALLING_OBJECT_HEIGHT;

          if (
            playerLeft < objectRight &&
            playerRight > objectLeft &&
            playerTop < objectBottom &&
            playerBottom > objectTop
          ) {
            getHit();
          }
        });

        setFallingObjects((prevObjects) =>
          prevObjects.filter((obj) => obj.positionY + FALLING_OBJECT_HEIGHT < gameAreaHeight)
        );

        setTimeout(() => (groundHitRef.current = false), 50);
      }
    }
  }, [fallingObjects, scoredObjects]);

  const onRestart = () => {
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setLives(3);
    updateFirebaseLives(gameId, 3);
    setFallingObjects([]);
    setScoredObjects(new Set());
    playerPositionRef.current = gameAreaWidth / 2 - PLAYER_WIDTH / 2;
  };

  const onButtonPress = (direction) => {
    setMovement(direction);
    updateFirebaseMovement(gameId, direction);
  };

  useEffect(() => {
    if (movement) {
      const moveInterval = setInterval(() => {
        movePlayer(movement);
      }, 1000 / 60);

      return () => clearInterval(moveInterval);
    }
  }, [movement]);

  const onTapMovement = (direction) => {
    movePlayer(direction);
  };

  const movePlayer = (direction) => {
    if (direction === "left") {
      playerPositionRef.current = Math.max(playerPositionRef.current - playerSpeed, 0);
    } else if (direction === "right") {
      playerPositionRef.current = Math.min(playerPositionRef.current + playerSpeed, gameAreaWidth - PLAYER_WIDTH);
    }
  };

  const pauseGame = () => {
    setPaused(true);
  };

  const resumeGame = () => {
    setPaused(false);
  };

  const gameArea = (
    <View style={styles.gameArea}>
      <View
        style={[styles.player, { left: playerPositionRef.current }]}>
        <Text style={styles.playerText}>U</Text>
      </View>

      {fallingObjects.map((obj) => (
        <View
          key={obj.id}
          style={[styles.fallingObject, { left: obj.positionX, top: obj.positionY }]}
        />
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

      <View style={styles.statsContainer}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
        <LivesDisplay lives={lives} />
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
        <TouchableOpacity style={styles.controlButton} onPress={pauseGame}>
          <Text style={styles.controlButtonText}>Pause</Text>
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

      <GameOverModal 
        gameOver={gameOver} 
        onRestart={onRestart} />

      <PauseModal
        visible={paused}
        onResume={resumeGame}
        onRestart={onRestart}
        onMainMenu={() => navigation.navigate("MainScreen")} // Fixed navigation to go to MainScreen
      />
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
    width: 50,
    height: 50,
    backgroundColor: "red",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    top: 50,
    zIndex: 1,
  },
  livesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    top: 50,
    zIndex: 1,
  },
  lifeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#222",
  },
  controlButton: {
    width: 100,
    height: 50,
    padding: 10,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  scoreContainer: {
    position: "absolute",
    zIndex: 1,
  },
  scoreText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default SinglePlayerScreen;
