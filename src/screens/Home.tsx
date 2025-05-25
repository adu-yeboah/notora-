import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { getNotes, } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import NoteItem from '../components/noteItem';
import { NoteType } from '../types/note';
import { useTheme } from '../hooks/useTheme';

interface HomeProps {
  navigation: any;
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [search, setSearch] = useState('Search notes');

    const theme = useTheme()
  
  useEffect(() => {
    const loadNotes = async () => {
      const allNotes = await getNotes();
      setNotes(allNotes);
    };
    loadNotes();
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const categorizedNotes = {
    'Previous 7 Days': filteredNotes.filter(note => new Date(note.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    'Previous 30 Days': filteredNotes.filter(note => new Date(note.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && new Date(note.timestamp) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  };

  return (
    <View className="flex-1 p-4 bg-background">
      <View className="flex-row justify-between">
        <Image 
          source={require("../../assets/logo.png")}
          resizeMode="cover"
          style={{height: 32, width: 120}}
           />

        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={24} color={theme.theme["--color-accent"]}/>
        </TouchableOpacity>
      </View>

      <View
        className='p-2 flex flex-row gap-1 bg-gray-200 rounded-md w-full items-center mt-5'
        >
          <Ionicons name='search' size={24}/>
        <TextInput
          className=" p-2 rounded-lg my-2] "
          placeholder="Search"
          placeholderTextColor='#a0a0a0'
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {Object.keys(categorizedNotes).map(category => (
        <View key={category}>
          <Text className="text-[${fontSize + 4}px] font-bold  mt-4">{category}</Text>
          {/* <FlatList
            // data={}
            renderItem={({ item }) => (
              <NoteItem
                note={item}
                onPress={(note: any) => navigation.navigate('NoteViewer', { note })}
              />
            )}
            keyExtractor={item => item.id}
          /> */}
        </View>
      ))}
      <TouchableOpacity
        className="absolute bottom-5 right-5 bg-accent rounded-full p-4"
        onPress={() => navigation.navigate('NoteEditor', { note: null })}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

    </View>
  );
};

export default Home;