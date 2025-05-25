import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/appNavigator";
import { StatusBar } from "react-native";
import "./global.css"
import { ThemeProvider } from "./src/context/themeContext";
import { useTheme } from "./src/hooks/useTheme";

export default function App() {
  const theme = useTheme()
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
