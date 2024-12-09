import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, StyleSheet, Button } from "react-native";
import SinglePlayerScreen from "./screens/SinglePlayerScreen";
import DuelModeScreen from "./screens/DuelModeScreen";

const Stack = createStackNavigator();

const App = () => {
  const [gameMode, setGameMode] = useState(null); // State to hold the selected game mode

  // Function to render home screen or game mode selection
  const renderHomeScreen = () => (
    <View style={styles.homeContainer}>
      <Text style={styles.homeTitle}>Dodge the Falling Objects</Text>
      <Button title="Single Player" onPress={() => setGameMode("single")} />
      <Button title="Duel Mode" onPress={() => setGameMode("duel")} />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {gameMode === null ? (
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {renderHomeScreen}
          </Stack.Screen>
        ) : gameMode === "single" ? (
          <Stack.Screen name="SinglePlayer" component={SinglePlayerScreen} />
        ) : (
          <Stack.Screen name="DuelMode" component={DuelModeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  homeTitle: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 50,
  },
});

export default App;
