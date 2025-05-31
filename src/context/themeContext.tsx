import React, { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { ThemeType } from "../types/theme";
import { vars } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
// import { StatusBar } from "expo-status-bar";

export const ThemeContext = createContext<ThemeType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {

  const [themeprop, setThemeProp] = useState<string>("dark")

  const themes = {
    dark: vars({
      "--color-background": "#1c2526",
      "---color-backgroundTwo": "#fff",
      "--color-text": "#fff",
      "--color-secondaryText": "#aaa",
      "--color-border": "#d6ccc2",
      "--color-accent": "#007bff",
    }),
    light: vars({
      "--color-background": "#fff",
      "---color-backgroundTwo": "#f6fff8",
      "--color-text": "#000",
      "--color-secondaryText": "#666",
      "--color-border": "#ccc",
      "--color-accent": "#007bff",
    })
  }

  useMemo(() => {
    AsyncStorage.setItem("theme", themeprop);
  }, [themeprop])


  const values = {
    themeprop,
    setThemeProp,
  }

  return (
    <ThemeContext.Provider value={values}>
      <StatusBar backgroundColor={themeprop && themeprop === "dark" ? "#1c2526" : "#fff"} />
      <SafeAreaView className="flex-1" style={themes[themeprop]}>
        {children}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
};