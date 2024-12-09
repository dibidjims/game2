import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../utils/firebaseConfig";

const useDuelGameSync = (gameId) => {
  const [gameData, setGameData] = useState({ fallingObjects: [] });

  useEffect(() => {
    const gameRef = ref(database, "games/" + gameId);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameData(data);
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  return gameData;
};

export default useDuelGameSync;
