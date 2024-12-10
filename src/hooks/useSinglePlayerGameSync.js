import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../utils/firebaseConfig"; // Import the firebase config

const useSinglePlayerGameSync = (gameId) => {
  const [gameData, setGameData] = useState({
    fallingObjects: [],
    highScore: 0,
    lives: 3,
    score: 0,
  });

  // Sync game data (falling objects, score, lives) with Firebase Realtime Database
  useEffect(() => {
    const gameRef = ref(database, `games/${gameId}/movement`);
    const highScoreRef = ref(database, `games/${gameId}/highscore`);
    const livesRef = ref(database, `games/${gameId}/lives`);
    const scoreRef = ref(database, `games/${gameId}/score`);

    // Handle Firebase data updates
    const unsubscribeGame = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameData((prev) => ({
          ...prev,
          fallingObjects: data.fallingObjects || [],
        }));
      }
    });

    const unsubscribeHighScore = onValue(highScoreRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameData((prev) => ({
          ...prev,
          highScore: data.score || 0,
        }));
      }
    });

    const unsubscribeLives = onValue(livesRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setGameData((prev) => ({
          ...prev,
          lives: data,
        }));
      }
    });

    const unsubscribeScore = onValue(scoreRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setGameData((prev) => ({
          ...prev,
          score: data,
        }));
      }
    });

    // Cleanup listeners when component is unmounted or gameId changes
    return () => {
      unsubscribeGame();
      unsubscribeHighScore();
      unsubscribeLives();
      unsubscribeScore();
    };
  }, [gameId]);

  // Update score in Firebase
  const updateScoreInFirebase = (score) => {
    const scoreRef = ref(database, `games/${gameId}/score`);
    set(scoreRef, score).catch((error) => {
      console.error("Error updating score:", error);
    });
  };

  // Update lives in Firebase
  const updateLivesInFirebase = (lives) => {
    const livesRef = ref(database, `games/${gameId}/lives`);
    set(livesRef, lives).catch((error) => {
      console.error("Error updating lives:", error);
    });
  };

  // Update high score in Firebase
  const updateHighScoreInFirebase = (score) => {
    const highScoreRef = ref(database, `games/${gameId}/highscore`);
    set(highScoreRef, score).catch((error) => {
      console.error("Error updating high score:", error);
    });
  };

  // Sync score and lives to Firebase whenever they change
  useEffect(() => {
    if (gameData.score !== undefined) {
      // Update score in Firebase
      updateScoreInFirebase(gameData.score);

      // Update high score if the current score exceeds the high score
      if (gameData.score > gameData.highScore) {
        updateHighScoreInFirebase(gameData.score);
      }
    }
  }, [gameData.score, gameData.highScore]);

  useEffect(() => {
    if (gameData.lives !== undefined) {
      // Sync lives to Firebase
      updateLivesInFirebase(gameData.lives);
    }
  }, [gameData.lives]);

  return gameData;
};

export default useSinglePlayerGameSync;
