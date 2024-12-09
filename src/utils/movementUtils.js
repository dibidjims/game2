import { debounce } from "lodash";  // Optional, or implement your own debounce function

// Debounced versions of the update functions
const debouncedUpdateScore = debounce((gameId, score) => {
  // Firebase code to update score
  console.log(`Updating score to ${score} for gameId: ${gameId}`);
  // Example: firebase.database().ref(`games/${gameId}`).update({ score });
}, 300);

const debouncedUpdateLives = debounce((gameId, lives) => {
  // Firebase code to update lives
  console.log(`Updating lives to ${lives} for gameId: ${gameId}`);
  // Example: firebase.database().ref(`games/${gameId}`).update({ lives });
}, 300);

export const updateFirebaseScore = (gameId, score) => {
  debouncedUpdateScore(gameId, score);
};

export const updateFirebaseLives = (gameId, lives) => {
  debouncedUpdateLives(gameId, lives);
};

// Example: Update movement state in Firebase if needed (Debounced)
export const updateFirebaseSingleMovement = (gameId, direction, score) => {
  // Firebase code for updating player movement
  console.log(`Movement: ${direction}, Score: ${score}, GameId: ${gameId}`);
  // Example: firebase.database().ref(`games/${gameId}/movement`).set({ direction });
};
