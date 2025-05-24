import { useState, useEffect } from "react";
import { vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeType } from "../types/theme";


const defaultTheme = vars({
  "--color-background": "#1c2526",
  "--color-text": "#fff",
  "--color-secondaryText": "#aaa",
  "--color-border": "#333",
  "--color-accent": "#007bff",
});

const lightTheme = vars({
  "--color-background": "#fff",
  "--color-text": "#000",
  "--color-secondaryText": "#666",
  "--color-border": "#ccc",
  "--color-accent": "#007bff",
});

export const useTheme = (): ThemeType => {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme === "light" ? lightTheme : defaultTheme);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme["--color-background"] === "#1c2526" ? lightTheme : defaultTheme;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(
        "theme",
        newTheme["--color-background"] === "#1c2526" ? "dark" : "light"
      );
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

 

  return { theme, toggleTheme };
};