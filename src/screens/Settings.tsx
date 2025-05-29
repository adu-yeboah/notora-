import React, { useContext } from "react";
import { View, Text, Switch, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/themeContext";

const Settings = () => {
  const { themeprop, setThemeProp } = useContext(ThemeContext);

  const toggleTheme = () => {
    setThemeProp(themeprop === "dark" ? "light" : "dark");
  };

  const navigation = useNavigation();
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 p-4 bg-[var(--color-background)]">
      <View className="flex flex-row gap-4 items-center">
        <TouchableOpacity onPress={handleBack}>
          <MaterialCommunityIcons name="keyboard-backspace" size={40} color="grey" />
        </TouchableOpacity>

        <Text className="text-[var(--color-text)] font-bold text-2xl">
          Settings
        </Text>
      </View>
      <View className="flex-row justify-between items-center my-4">
        <Text className="text-lg text-[var(--color-text)]">
          {themeprop.charAt(0).toUpperCase() + themeprop.slice(1)} Mode
        </Text>
        <Switch
          value={themeprop === "dark"}
          onValueChange={toggleTheme}
          trackColor={{
            false: "gray",
            true: "blue",
          }}
          thumbColor="orange"
        />
      </View>
    </View>
  );
};

export default Settings;