import React from 'react';
import { View } from 'react-native';

const Slider = ({ value, minimumValue, maximumValue, onSlidingComplete }) => {
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View className="h-4">
      <View className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-full" />
      <View 
        className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full" 
        style={{ width: `${percentage}%` }} 
      />
      <View
        className="absolute top-0 h-4 w-4 bg-blue-500 rounded-full"
        style={{ left: `${percentage}%`, marginLeft: -8 }}
      />
    </View>
  );
};

export default Slider;