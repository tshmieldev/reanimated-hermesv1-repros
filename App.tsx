/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from "@react-native/new-app-screen";
import { StatusBar, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import Animated from "react-native-reanimated";

function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <AppContent />
      <Animated.View
        style={{
          animationName: {
            from: { opacity: 1 },
            to: { opacity: 0.2 },
          },
          animationDuration: "500ms",
          animationIterationCount: "infinite",
          animationDirection: "alternate",
        }}
      >
        <Text>Skibidi</Text>
      </Animated.View>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen templateFileName="App.tsx" safeAreaInsets={safeAreaInsets} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
