 import React, { createContext, ReactNode } from "react";
import { useTheme } from "../hooks/useTheme";
import { View } from "react-native";
import { ThemeType } from "../types/theme";

export const ThemeContext = createContext<ThemeType | undefined | any>(undefined);

interface ThemeProviderProps  {
  children: ReactNode;
};

export const ThemeProvider = ({ children } : ThemeProviderProps) => {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      <View style={themeData.theme} className={`flex-1 ${themeData.theme["--color-background"] === "#1c2526" ? "dark" : "white"}`}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};