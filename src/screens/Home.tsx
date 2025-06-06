import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { deleteRecord, getNotes, getRecords } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import NoteItem from '../components/noteItem';
import { NoteType, RecordType } from '../types/note';
import { useNavigation } from '@react-navigation/native';
import RecordCard from '../components/recordCard';
import { RecordingData } from './Recorder';

const Home = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [records, setRecords] = useState<RecordType[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [allNotes, allRecords] = await Promise.all([getNotes(), getRecords()]);
      setNotes(allNotes);
      setRecords(allRecords);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, []);

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playRecording = (recording: RecordingData) => {
    navigation.navigate('AudioPlayer', {
      uri: recording.uri,
      name: recording.name,
      id: recording.id
    });
  };

  const deleteRecording = async (id: string ) => {
    try {
      // Implement your delete recording logic here
      await deleteRecord(id);
      loadData();
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const filteredData = {
    notes: notes.filter(note =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    ),
    records: records.filter(record =>
      record.name.toLowerCase().includes(search.toLowerCase())
    )
  };

  const categorizedData = {
    'Recent (Last 7 Days)': {
      notes: filteredData.notes.filter(note => 
        new Date(note.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ),
      records: filteredData.records.filter(record => 
        new Date(record.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    },
    'Older (Last 30 Days)': {
      notes: filteredData.notes.filter(note => 
        new Date(note.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && 
        new Date(note.timestamp) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ),
      records: filteredData.records.filter(record => 
        new Date(record.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && 
        new Date(record.timestamp) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
    },
    'Archived': {
      notes: filteredData.notes.filter(note => 
        new Date(note.timestamp) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ),
      records: filteredData.records.filter(record => 
        new Date(record.timestamp) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
    }
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
          placeholder="Search notes and recordings..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Combined List */}
      <FlatList
        data={Object.entries(categorizedData)}
        keyExtractor={([category]) => category}
        renderItem={({ item: [category, { notes: categoryNotes, records: categoryRecords }] }) => (
          <View className="mb-6">
            {(categoryNotes.length > 0 || categoryRecords.length > 0) && (
              <>
                <Text className="text-lg font-semibold text-gray-200 mb-3 ml-1">{category}</Text>
                
                {/* Notes Section */}
                {categoryNotes.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-md font-medium text-gray-300 mb-2">Notes</Text>
                    <View className="space-y-3">
                      {categoryNotes.map(note => (
                        <NoteItem
                          key={`note-${note.id}`}
                          note={note}
                          onPress={() => navigation.navigate('NoteViewer', { note })}
                        />
                      ))}
                    </View>
                  </View>
                )}
                
                {/* Recordings Section */}
                {categoryRecords.length > 0 && (
                  <View>
                    <Text className="text-md font-medium text-gray-300 mb-2">Recordings</Text>
                    <View className="space-y-3">
                      {categoryRecords.map(record => (
                        <RecordCard
                          key={`record-${record.id}`}
                          item={record}
                          playRecording={playRecording}
                          deleteRecording={deleteRecording}
                          format={formatDuration}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-200 text-lg">No items found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={loadData}
      />

      {/* Add Buttons */}
      <View className="absolute bottom-6 right-6 flex-row space-x-4">
        <TouchableOpacity
          className="bg-blue-500 rounded-full p-4 shadow-lg"
          onPress={() => navigation.navigate('Add' as never)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

       
      </View>
    </View>
  );
};

export default Home;