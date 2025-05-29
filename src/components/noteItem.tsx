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
    <TouchableOpacity onPress={() => onPress(note)} className='border border-border p-4 rounded-lg my-2 h-max'>
      <Text className='text-lg text-secondaryText font-bold'>{note.title}</Text>
      <Text className=' text-md text-text px line-clamp-2]'>{note.content}</Text>
      
    </TouchableOpacity>
  );
};

export default NoteItem;