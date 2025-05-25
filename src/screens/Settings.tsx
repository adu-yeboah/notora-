import React from 'react';
import { View, Text, Switch, Button } from 'react-native';
import { useTheme } from '../hooks/useTheme';


const Settings = () => {
  const { theme, toggleTheme } = useTheme();  

  return (
    <View className={`flex-1 p-4 `}>
      <Text className={`text-xl font-bold text-text`}>Settings</Text>
      <View className="flex-row justify-between my-4">
        <Text className={`text-lg `}>Dark Mode</Text>
        <Switch
          value={theme.theme}
          onValueChange={() => {
            toggleTheme();
          }}
        />
      </View>
     
    </View>
  );
};

export default Settings;