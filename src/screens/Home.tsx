import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { getNotes, getRecords } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import NoteItem from '../components/noteItem';
import { NoteType } from '../types/note';
import { useNavigation } from '@react-navigation/native';


const Home= () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const navigation  = useNavigation()
  const loadNotes = async () => {
    try {
      setRefreshing(true);
      const allNotes = await getNotes();
      const allRecords = await getRecords()
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadNotes);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadNotes();
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  const categorizedNotes = {
    'Recent (Last 7 Days)': filteredNotes.filter(note => 
      new Date(note.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ),
    'Older (Last 30 Days)': filteredNotes.filter(note => 
      new Date(note.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && 
      new Date(note.timestamp) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ),
    'Archived': filteredNotes.filter(note => 
      new Date(note.timestamp) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
  };

  return (
    <View className="flex-1 bg-background p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Image 
          source={require("../../assets/logo.png")}
          resizeMode="contain"
          className="h-8 w-32"
        />
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
          <Ionicons name="settings" size={24} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-200 rounded-lg px-4 py-1 mb-6 shadow-sm">
        <Ionicons name="search" size={20} color="#9ca3af" className="mr-2" />
        <TextInput
          className="flex-1 text-gray-800 text-base"
          placeholder="Search notes..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Notes List */}
      <FlatList
        data={Object.entries(categorizedNotes)}
        keyExtractor={([category]) => category}
        renderItem={({ item: [category, categoryNotes] }) => (
          <View className="mb-6">
            {categoryNotes.length > 0 && (
              <>
                <Text className="text-lg font-semibold text-gray-200 mb-3 ml-1">{category}</Text>
                <View className="space-y-3">
                  {categoryNotes.map(note => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      onPress={() => navigation.navigate('NoteViewer', { note })}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-200 text-lg">No notes found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={loadNotes}
      />

      {/* Add Note Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 rounded-full p-4 shadow-lg"
        onPress={() => navigation.navigate('Add' as never)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Home;