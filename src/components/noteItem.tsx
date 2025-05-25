import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NoteType } from '../types/note';

interface NoteItemProps {
  note: NoteType;
  onPress: (note: NoteType) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(note)} className='border p-4 rounded-lg my-2'>
      <Text className='text-[${fontSize + 2}px] font-bold'>{note.title}</Text>
      <Text className=' text-[${fontSize - 2}px]'>{note.content.slice(0, 50)}...</Text>
      <View className="flex-row mt-2">
        {note.tags.map((tag, index) => (
          <View key={index} className='bg-${theme.colors.accent} rounded px-2 py-1 mr-2'>
            <Text className="text-white text-[${fontSize - 4}px]">#{tag}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row mt-2">
        {note.audioUri && <Ionicons name="play" size={20} color="#3b82f6" style={{ marginRight: 10 }} />}
        {note.slideUri && <Ionicons name="image" size={20} color="#3b82f6" />}
      </View>
    </TouchableOpacity>
  );
};

export default NoteItem;