import React, { createContext, ReactNode, useEffect, useState } from "react";
import { View } from "react-native";
import { ThemeType } from "../types/theme";
import { useColorScheme, vars } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext<ThemeType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {

  const [themeprop, setThemeProp] = useState<string>("dark")
  const themes = {
    dark: vars({
      "--color-background": "#1c2526",
      "--color-text": "#fff",
      "--color-secondaryText": "#aaa",
      "--color-border": "#d6ccc2",
      "--color-accent": "#007bff",
    }),
    light: vars({
      "--color-background": "#fff",
      "--color-text": "#000",
      "--color-secondaryText": "#666",
      "--color-border": "#ccc",
      "--color-accent": "#007bff",
    })
  }

  useEffect(() => {
    AsyncStorage.setItem("theme", themeprop);
  }, [themeprop])

  const values ={
    themeprop,
    setThemeProp,
  }

  return (
    <ThemeContext.Provider value={values}>
      <SafeAreaView
        className="flex-1"
       style={themes[themeprop]}
      >
        {children}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
};