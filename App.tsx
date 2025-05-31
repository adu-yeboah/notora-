import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/appNavigator";
import "./global.css"
import { ThemeProvider } from "./src/context/themeContext";


export default function App() {

  return (
    <NavigationContainer>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </NavigationContainer>
  );
}
