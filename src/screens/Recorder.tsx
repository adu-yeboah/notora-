import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, TextInput, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useAudioRecorder, RecordingPresets } from 'expo-audio';
import { useNavigation } from '@react-navigation/native';
import PlaybackScreen from './PlaybackScreen';

interface RecordingData {
  uri: string;
  name: string;
  duration: number;
  date: string;
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

  useEffect(() => {
    const requestPermissions = async () => {
      const status = await Audio.requestRecordingPermissionsAsync();
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

  const saveRecordingWithTitle = () => {
    if (!newRecordingUri || !recordingTitle.trim()) return;

    const newRecording: RecordingData = {
      uri: newRecordingUri,
      name: recordingTitle,
      duration: recordingTime,
      date: new Date().toLocaleString(),
    };

    setRecordings(prev => [newRecording, ...prev]);
    setRecordingTitle('');
    setNewRecordingUri(null);
    setShowTitleModal(false);
  };

  const playRecording = (uri: string, name: string) => {
    navigation.navigate('AudioPlayer', { 
      uri, 
      name,
      onDelete: () => deleteRecording(uri),
      onRename: (newName: string) => renameRecording(uri, newName)
    });
  };

  const deleteRecording = async (uri: string) => {
    try {
      await FileSystem.deleteAsync(uri);
      setRecordings(prev => prev.filter(r => r.uri !== uri));
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete recording');
    }
  };

  const renameRecording = (uri: string, newName: string) => {
    setRecordings(prev => 
      prev.map(r => r.uri === uri ? { ...r, name: newName } : r)
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex flex-row gap-2 items-center">
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="keyboard-backspace" size={40} color="grey" />
          </TouchableOpacity>

          <Image
            source={require("../../assets/logo.png")}
            resizeMode="contain"
            className="h-8 w-32"
          />
        </View>
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
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-medium text-gray-800 flex-1 mr-2" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-gray-500 text-sm">{item.date}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">{formatTime(item.duration)}</Text>
                <View className="flex-row space-x-5">
                  <TouchableOpacity
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onPress={() => playRecording(item.uri, item.name)}
                  >
                    <Ionicons name="play" size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-500 px-4 py-2 rounded-lg"
                    onPress={() => deleteRecording(item.uri)}
                  >
                    <Ionicons name="trash-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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

const TitleModal = ({ visible, onClose, title, onChangeTitle, onSave }) => (
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
        <View className="flex-row justify-end space-x-3">
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