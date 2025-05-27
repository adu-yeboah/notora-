import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToolbarProps {
  onFormat?: (type: 'bold' | 'italic' | 'underline' | 'h1' | 'h2') => void;
  onColor?: (color: string) => void;
  onCamera?: () => void;
  onRecord?: () => void;
  onTTS?: () => void;
  onTag?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onFormat, onColor, onCamera, onRecord, onTTS, onTag }) => {
  const [isFormatMenuVisible, setFormatMenuVisible] = useState(false);
  const toolbarRef = useRef<View>(null);

  const formatOptions = [
    { label: 'B', value: 'bold', style: { fontWeight: 'bold' } },
    { label: 'I', value: 'italic', style: { fontStyle: 'italic' } },
    { label: 'U', value: 'underline', style: { textDecorationLine: 'underline' } },
    { label: 'H1', value: 'h1' },
    { label: 'H2', value: 'h2' },
  ];

  const colorOptions = [
    { color: '#000000' }, // Black
    { color: '#ADD8E6' }, // Light Blue
    { color: '#90EE90' }, // Light Green
    { color: '#FFFFE0' }, // Light Yellow
    { color: '#E6E6FA' }, // Lavender
  ];

  const handleFormatSelect = (type: 'bold' | 'italic' | 'underline' | 'h1' | 'h2') => {
    onFormat?.(type);
    setFormatMenuVisible(false);
  };

  const handleColorSelect = (color: string) => {
    onColor?.(color);
    setFormatMenuVisible(false);
  };

  return (
    <View>
      <View
        ref={toolbarRef}
        className="border border-border flex-row justify-around p-2 rounded-lg my-4"
      >
        <TouchableOpacity onPress={() => setFormatMenuVisible(true)}>
          <Ionicons name="text" size={24} color="grey" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCamera}>
          <Ionicons name="camera" size={24} color="grey" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRecord}>
          <Ionicons name="mic" size={24} color="grey" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onTTS}>
          <Ionicons name="volume-high" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onTag}>
          <Ionicons name="pricetag" size={24} color="grey" />
        </TouchableOpacity>
      </View>

      {isFormatMenuVisible && (
        <Pressable
          className="absolute inset-0"
          onPress={() => setFormatMenuVisible(false)}
        >
          <View
            className="absolute bottom-16 w-full flex-col items-center"
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 8,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <View className="flex-row justify-center mb-2">
              {formatOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  className="px-3 py-2"
                  onPress={() => handleFormatSelect(option.value as 'bold' | 'italic' | 'underline' | 'h1' | 'h2')}
                >
                  <Text
                    className="text-lg"
                    style={[
                      option.style,
                      { color: index % 2 === 0 ? '#ef4444' : '#f97316' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-center">
              {colorOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.color}
                  className="w-6 h-6 rounded-full mx-2"
                  style={{ backgroundColor: option.color }}
                  onPress={() => handleColorSelect(option.color)}
                />
              ))}
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default Toolbar;