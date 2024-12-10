import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const MainScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Just Dodge</Text>
      <Button
        title="Single Player"
        onPress={() => navigation.navigate("SinglePlayer")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 50,
  },
});

export default MainScreen;
