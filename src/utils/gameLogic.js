// utils/gameLogic.js
import { randomPosition } from './utils'; // Assume you have a utility for random positions

const FALLING_OBJECT_HEIGHT = 50;
const PLAYER_HEIGHT = 30;
const PLAYER_WIDTH = 30;
const FALLING_OBJECT_WIDTH = 50;
const GROUND_LEVEL = 500;

export const generateFallingObjects = (screenWidth, screenHeight) => {
  return [
    {
      id: Math.random().toString(),
      positionX: randomPosition(screenWidth - FALLING_OBJECT_WIDTH),
      positionY: 0,
    },
    {
      id: Math.random().toString(),
      positionX: randomPosition(screenWidth - FALLING_OBJECT_WIDTH),
      positionY: 0,
    },
  ];
};

export const movePlayer = (playerPosition, direction, playerSpeed, screenWidth) => {
  if (direction === "left") {
    return Math.max(playerPosition - playerSpeed, 0);
  } else if (direction === "right") {
    return Math.min(playerPosition + playerSpeed, screenWidth - PLAYER_WIDTH);
  }
};

export const updateFallingObjects = (fallingObjects, fallSpeed, screenHeight) => {
  return fallingObjects
    .map((obj) => ({ ...obj, positionY: obj.positionY + fallSpeed }))
    .filter((obj) => obj.positionY < screenHeight);
};

export const checkCollisions = (playerPosition, fallingObjects) => {
  const playerLeft = playerPosition;
  const playerRight = playerPosition + PLAYER_WIDTH;
  const playerTop = GROUND_LEVEL - PLAYER_HEIGHT;
  const playerBottom = GROUND_LEVEL;

  for (const obj of fallingObjects) {
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
      return true; // Collision detected
    }
  }
  return false; // No collision
};
