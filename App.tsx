import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/appNavigator";
import { StatusBar, Text, View } from "react-native";
import "./global.css"
import { ThemeContext, ThemeProvider } from "./src/context/themeContext";
import { useContext } from "react";

export default function App() {

  return (
    <NavigationContainer>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </NavigationContainer>
  );
}
