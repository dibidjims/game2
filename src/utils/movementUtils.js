import { debounce } from "lodash";  // Optional, or implement your own debounce function
import { ref, set } from "firebase/database";
import { database } from "../utils/firebaseConfig"; // Import Firebase configuration

// Debounced versions of the update functions
const debouncedUpdateScore = debounce((gameId, score) => {
  // Firebase code to update score
  console.log(`Updating score to ${score} for gameId: ${gameId}`);
  const scoreRef = ref(database, `games/${gameId}/score`);
  set(scoreRef, score).catch((error) => {
    console.error("Error updating score:", error);
  });
}, 300);

const debouncedUpdateLives = debounce((gameId, lives) => {
  // Firebase code to update lives
  console.log(`Updating lives to ${lives} for gameId: ${gameId}`);
  const livesRef = ref(database, `games/${gameId}/lives`);
  set(livesRef, lives).catch((error) => {
    console.error("Error updating lives:", error);
  });
}, 300);

// Debounced movement update
const debouncedUpdateMovement = debounce((gameId, direction, score) => {
  // Firebase code for updating player movement
  console.log(`Movement: ${direction}, Score: ${score}, GameId: ${gameId}`);
  const movementRef = ref(database, `games/${gameId}/movement`);
  set(movementRef, { direction }).catch((error) => {
    console.error("Error updating movement:", error);
  });
}, 300);

export const updateFirebaseScore = (gameId, score) => {
  debouncedUpdateScore(gameId, score);
};

export const updateFirebaseLives = (gameId, lives) => {
  debouncedUpdateLives(gameId, lives);
};

export const updateFirebaseMovement = (gameId, direction) => {
  debouncedUpdateMovement(gameId, direction);
};
