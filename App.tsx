import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/appNavigator";
import { StatusBar, Text, View } from "react-native";
import "./global.css"
import { ThemeProvider } from "./src/context/themeContext";

export default function App() {

  return (
    <NavigationContainer>
      <ThemeProvider>
        <StatusBar 
        translucent={false} 
        hidden={false} 
        // backgroundColor={`${theme.theme["--color-background"]}`}
         barStyle={"light-content"} />
        <AppNavigator />
      </ThemeProvider>
    </NavigationContainer>
  );
}
