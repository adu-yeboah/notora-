import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, TextInput, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { deleteRecord, getRecords, saveRecord } from '../utils/storage';
import Heading from '../components/ui/heading';
import RecordCard from '../components/recordCard';

export interface RecordingData {
  id: string;
  uri: string;
  name: string;
  duration: number;
  timestamp: string;
}

const AudioRecorder = () => {
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [newRecordingUri, setNewRecordingUri] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const navigation = useNavigation();


  useMemo(() => {
    const loadRecordings = async () => {
      try {
        const savedRecordings = await getRecords();
        setRecordings(savedRecordings);
      } catch (error) {
        console.error('Error loading recordings:', error);
      }
    };

    loadRecordings();

    // Request Permission
    const requestPermissions = async () => {
      const status = await AudioModule.getRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Microphone access is required.');
      }
    };
    requestPermissions();

    return () => {
      const cleanup = async () => {
        try {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          if (recorder.isRecording) {
            await recorder.stop();
          }

          await recorder.release();
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      };

      cleanup();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const ensureDirExists = async () => {
    const dir = `${FileSystem.documentDirectory}recordings`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  };

  const startRecording = async () => {
    try {
      await ensureDirExists();
      await recorder.prepareToRecordAsync();
      await recorder.record();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (error) {
      console.error('Start error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (recorder.isRecording) {
        await recorder.stop();
        const uri = recorder.uri;

        if (uri) {
          setNewRecordingUri(uri);
          setShowTitleModal(true);
        }
      }
    } catch (error) {
      console.error('Stop error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setIsRecording(false);
    }
  };

  const saveRecordingWithTitle = async () => {
    if (!newRecordingUri || !recordingTitle.trim()) return;



    const newRecording: RecordingData = {
      id: uuid.v4(),
      uri: newRecordingUri,
      name: recordingTitle,
      duration: recordingTime,
      timestamp: new Date().toISOString(),
    };


    try {
      // Save to local state
      setRecordings(prev => [newRecording, ...prev]);

      // Save to AsyncStorage
      await saveRecord(newRecording)
      

      setRecordingTitle('');
      setNewRecordingUri(null);
      setShowTitleModal(false);
    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  const playRecording = (recording: RecordingData) => {
    navigation.navigate('AudioPlayer', {
      uri: recording.uri,
      name: recording.name,
      id: recording.id
    });
  };

  const deleteRecording = async (id: string) => {
    try {
      await deleteRecord(id);

      // Delete from local state
      setRecordings(prev => prev.filter(r => r.id !== id));

      // Optionally delete the actual file
      const recordingToDelete = recordings.find(r => r.id === id);
      if (recordingToDelete) {
        await FileSystem.deleteAsync(recordingToDelete.uri).catch(e => console.log('File delete error:', e));
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete recording');
    }
  };

  const renameRecording = async (id: string, newName: string) => {
    try {
      // Update in AsyncStorage
      const updatedRecordings = recordings.map(r =>
        r.id === id ? { ...r, name: newName } : r
      );
      await AsyncStorage.setItem('records', JSON.stringify(updatedRecordings));

      // Update local state
      setRecordings(updatedRecordings);
    } catch (error) {
      console.error('Rename error:', error);
      Alert.alert('Error', 'Failed to rename recording');
    }
  };


  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Heading />
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600">
            {isRecording ? formatTime(recordingTime) : 'Ready to record'}
          </Text>
          <TouchableOpacity
            className={`px-6 py-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-lg font-semibold text-gray-800 mb-3">Your Recordings</Text>

      {recordings.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="musical-notes" size={48} color="#d1d5db" />
          <Text className="text-gray-400 mt-2">No recordings yet</Text>
        </View>
      ) : (
        <FlatList
          data={recordings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecordCard item={item} playRecording={playRecording} deleteRecording={deleteRecord} format={formatTime}/>
          )}
        />
      )}

      <TitleModal
        visible={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        title={recordingTitle}
        onChangeTitle={setRecordingTitle}
        onSave={saveRecordingWithTitle}
      />
    </View>
  );
};

export default AudioRecorder;

interface TitleModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onChangeTitle: (text: string) => void;
  onSave: () => void;
}

const TitleModal: React.FC<TitleModalProps> = ({ visible, onClose, title, onChangeTitle, onSave }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white p-6 rounded-lg w-4/5">
        <Text className="text-lg font-semibold mb-4">Name your recording</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Enter recording name"
          value={title}
          onChangeText={onChangeTitle}
          autoFocus
        />
        <View className="flex-row justify-end space-x-3 gap-2">
          <TouchableOpacity
            className="px-4 py-2 rounded-lg bg-gray-200"
            onPress={onClose}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg bg-blue-500"
            onPress={onSave}
          >
            <Text className="text-white">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);