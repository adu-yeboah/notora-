import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

interface Recording {
  uri: string;
  title: string;
  duration: number;
  date: string;
  size?: number;
}

const Recorder: React.FC = () => {
  const navigation = useNavigation();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [title, setTitle] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Verify and create directory if needed
  const ensureDirExists = async () => {
    const dir = `${FileSystem.documentDirectory}recordings`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    return dir;
  };

  // Request permissions
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Permission error:', error);
        setHasPermission(false);
      }
    };
    requestPermission();
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      if (hasPermission === false) {
        Alert.alert('Permission required', 'Microphone access is needed to record audio');
        return;
      }

      setIsLoading(true);
      await ensureDirExists();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingUri = `${FileSystem.documentDirectory}recordings/recording_${Date.now()}.m4a`;
      
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        recordingUri
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsLoading(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error('Recording file not found');
        }

        const newRecording: Recording = {
          uri,
          title: title || `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          date: new Date().toLocaleDateString(),
          size: fileInfo.size,
        };
        
        setRecordings(prev => [newRecording, ...prev]);
      }

    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to save recording');
    } finally {
      setRecording(null);
      setIsRecording(false);
      setTitle('');
      setIsLoading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, [recording]);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-800">Audio Recorder</Text>
      </View>

      {/* Recording Controls */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <TextInput
          className="border border-gray-200 rounded-lg p-3 mb-4 text-gray-800"
          placeholder="Enter recording title (e.g. Lecture Note)"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          editable={!isRecording}
        />

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600">
            {isRecording ? formatTime(recordingTime) : 'Ready to record'}
          </Text>

          <TouchableOpacity
            className={`flex-row items-center px-6 py-3 rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-blue-500'
            } ${isLoading ? 'opacity-50' : ''}`}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isLoading || hasPermission === false}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={20} 
              color="white" 
              className="mr-2"
            />
            <Text className="text-white font-medium">
              {isRecording ? "Stop" : "Record"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recordings List */}
      <Text className="text-lg font-semibold text-gray-800 mb-3">Your Recordings</Text>
      
      {recordings.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="musical-notes" size={48} color="#d1d5db" />
          <Text className="text-gray-400 mt-2">No recordings yet</Text>
        </View>
      ) : (
        <FlatList
          data={recordings}
          keyExtractor={(item, index) => `${index}-${item.uri}`}
          renderItem={({ item }) => (
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-medium text-gray-800 flex-1 mr-2" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-sm">{item.date}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-500">{formatTime(item.duration)}</Text>
                  {item.size && (
                    <Text className="text-gray-400 text-xs">
                      {(item.size / 1024).toFixed(1)} KB
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                  onPress={() => navigation.navigate('NoteEditor', { 
                    note: { 
                      audioUri: item.uri,
                      title: item.title
                    } 
                  })}
                >
                  <Text className="text-white">Use in Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Recorder;