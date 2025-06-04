import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Heading from '../components/ui/heading';
import { deleteRecord, renameRecord } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { RecordType } from '../types/note';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// import axios from 'axios';

interface AudioPlayerProps {
  route: {
    params: RecordType;
  };
}

const AudioPlayer = ({ route }: AudioPlayerProps) => {

  const api_key = process.env.EXPO_PUBLIC_ASSEMBLY_API_KEY;

  const { uri, name, id } = route.params;
  const navigation = useNavigation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);

  const player = useAudioPlayer(uri);

  console.log(position);

  useEffect(() => {
    const initializePlayer = async () => {
      if (!player) {
        setIsLoading(false);
        return;
      }
      try {
        while (!player.isLoaded) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        console.log('Player duration:', player.duration);
        setDuration(player.duration || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Player initialization error:', error);
        Alert.alert('Error', 'Failed to initialize audio player');
        setIsLoading(false);
      }
    };
    initializePlayer();
  }, [player]);


  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (player && player.playing) {
        console.log('Current time:', player.currentTime);
        setPosition(player.currentTime);
      }
    }, 250);
    return () => clearInterval(updateInterval);
  }, [player, isPlaying, isSeeking]);


  useEffect(() => {
    if (player) {
      setIsPlaying(player.playing);
    }
  }, [player?.playing]);


  // Toggle playback function
  const togglePlayback = async () => {
    if (!player || !player.isLoaded) return console.log("Player not loaded");

    try {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to toggle playback');
    }
  };

  const handleSeek = async (value: number) => {
    setIsPlaying(false);
    console.log('Seeking to:', value);
    if (!player || !player.isLoaded) return player.replace(uri);
    try {
      await player.seekTo(value);
      setPosition(value);
      setIsSeeking(false);
      if (isPlaying) {
        player.play();
      }
    } catch (error) {
      console.error('Seek error:', error);
      Alert.alert('Error', 'Failed to seek audio');
    }
  };

  const handleSliderValueChange = (value: number) => {
    console.log('Slider value changed:', value);
    setIsSeeking(true);
    setPosition(value);
  };

  const handleSliderSlidingStart = async () => {
    console.log('Slider sliding started');
    setIsSeeking(true);
    if (player && isPlaying && player.isLoaded) {
      player.pause();
    }
  };


  // Playback rate function
  const changePlaybackRate = async (rate: number) => {
    console.log('Changing playback rate to:', rate);
    setPlaybackRate(rate);
    if (!player || !player.isLoaded) {
      console.log('Player not loaded');
      return;
    }
    try {
      await player.setPlaybackRate(rate); // Use the new rate directly
    } catch (error) {
      console.error('Playback rate error:', error);
      Alert.alert('Error', 'Failed to change playback rate');
    }
  };



  // Delete Recording
  const handleDelete = async () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecord(id);
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete recording');
            }
          },
        },
      ]
    );
  };

  // Handle renaming the recording
  const handleRename = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }
    try {
      await renameRecord(id, { name: newName });
      setShowRenameModal(false);
      navigation.setParams({ name: newName });
    } catch (error) {
      console.error('Rename error:', error);
      Alert.alert('Error', 'Failed to rename recording');
    }
  };

  // Transcription function
  const transcribeAudio = async () => {
    if (!uri) {
      Alert.alert('Error', 'No audio file provided');
      return;
    }

    setIsTranscribing(true);
    setTranscript('');
    setTranscriptionProgress(0);

    try {
      console.log('Reading audio file:', uri);
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Audio base64 length:', audioBase64.length);

      console.log('Uploading to AssemblyAI');
      const uploadResponse = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        { audio: `data:audio/mp3;base64,${audioBase64}` },
        { headers: { Authorization: api_key } }
      );
      console.log('Upload response:', uploadResponse.data);

      const audioUrl = uploadResponse.data.upload_url;

      console.log('Starting transcription');
      const transcribeResponse = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl },
        { headers: { Authorization: api_key } }
      );
      console.log('Transcribe response:', transcribeResponse.data);

      const transcriptId = transcribeResponse.data.id;

      const interval = setInterval(async () => {
        const statusResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          { headers: { Authorization: api_key } }
        );
        console.log('Status response:', statusResponse.data);

        setTranscriptionProgress((prev) => Math.min(prev + 10, 95));

        if (statusResponse.data.status === 'completed') {
          clearInterval(interval);
          setTranscript(statusResponse.data.text || 'No transcript available');
          setTranscriptionProgress(100);
          setIsTranscribing(false);
          console.log('Transcript set:', statusResponse.data.text);
        } else if (statusResponse.data.status === 'error') {
          clearInterval(interval);
          Alert.alert('Error', `Transcription failed: ${statusResponse.data.error}`);
          setIsTranscribing(false);
        }
      }, 5000); // Increased interval for longer audio
    } catch (error) {
      console.error('Transcription error:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to transcribe audio: ${error.message}`);
      setIsTranscribing(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4 justify-center items-center">
        <Text>Loading audio...</Text>
      </View>
    );
  }

  // if (!player || !player.isLoaded) {
  //   return (
  //     <View className="flex-1 bg-background p-4 justify-center items-center">
  //       <Text>Failed to load audio player</Text>
  //     </View>
  //   );
  // }

  return (
    <View className="flex-1 bg-background p-4">
      {/* HEADING */}
      <Heading />

      {/* UTILS */}
      <View className="flex-row justify-end gap-4 mb-4">
        <TouchableOpacity
          className="flex items-center"
          onPress={transcribeAudio}
          disabled={isTranscribing}
        >
          <MaterialCommunityIcons name="transcribe" size={25} color="grey" />
        </TouchableOpacity>


        <TouchableOpacity
          className="flex items-center"
          onPress={() => setShowRenameModal(true)}
        >
          <Ionicons name="pencil-outline" size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex items-center"
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      </View>


      <View className="bg-secondary rounded-xl p-6 mb-8 gap-3 flex-1">
        <Text className="text-2xl text-text font-bold text-center mb-2" numberOfLines={1}>
          {name}
        </Text>

        <View className="rounded-lg max-h-min my-6 justify-center items-center flex-auto">
          <Image
            source={require("../../assets/player.png")}
            className="h-32 w-32"
            resizeMode="contain"
          />
        </View>

        <View className="mb-4" style={{ width: '100%' }}>
          <View className="flex-row justify-between mb-1">
            <Text className="text-secondaryText">{formatTime(position)}</Text>
            <Text className="text-secondaryText">{formatTime(duration)}</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 40 }}
            value={position}
            minimumValue={0}
            maximumValue={duration}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#3b82f6"
            onValueChange={handleSliderValueChange}
            onSlidingStart={handleSliderSlidingStart}
            onSlidingComplete={handleSeek}
            step={0.1}
          />
        </View>

        {/* CONTROLS */}
        <View className="flex-row justify-center gap-6 w-full items-center space-x-12">
          <TouchableOpacity
            onPress={() => changePlaybackRate(Math.max(0.5, playbackRate - 0.5))} // Decrease by 0.5, min 0.5
            className="flex items-center flex-col"
          >
            <Ionicons name="arrow-undo-sharp" size={34} color="grey" />
            <Text className="text-text text-sm">Slower</Text>
          </TouchableOpacity>

          <View className="flex items-center flex-col gap-2">
            <TouchableOpacity
              className="bg-blue-500 p-4 rounded-full"
              onPress={togglePlayback}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-text text-sm">{playbackRate.toFixed(1)}x</Text>
          </View>

          <TouchableOpacity
            onPress={() => changePlaybackRate(Math.min(2.0, playbackRate + 0.5))} // Increase by 0.5, max 2.0
            className="flex items-center flex-col"
          >
            <Entypo name="forward" size={34} color="grey" />
            <Text className="text-text text-sm">Faster</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          {/* <TouchableOpacity
            className="bg-green-500 py-2 px-4 rounded-lg mb-3"
            onPress={transcribeAudio}
            disabled={isTranscribing}
          >
            <Text className="text-white text-center">
              {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
            </Text>
          </TouchableOpacity> */}

          {isTranscribing && (
            <View className="w-full bg-gray-200 rounded-full min-h-max mb-3">
              <View
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${transcriptionProgress}%` }}
              ></View>
            </View>
          )}

          {transcript ? (
            <View className="bg-white p-3 rounded-lg">
              <Text className="font-semibold mb-1">Transcript:</Text>
              <Text>{transcript}</Text>
            </View>
          ) : isTranscribing ? (
            <Text>Transcription in progress...</Text>
          ) : null}
        </View>
      </View>


      <RenameModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        name={newName}
        onChangeName={setNewName}
        onSave={handleRename}
      />
    </View>
  );
};

interface RenameModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  onChangeName: (text: string) => void;
  onSave: () => void;
}

const RenameModal = ({ visible, onClose, name, onChangeName, onSave }: RenameModalProps) => (
  <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white p-6 rounded-lg w-4/5">
        <Text className="text-lg font-semibold mb-4">Rename recording</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Enter new name"
          value={name}
          onChangeText={onChangeName}
          autoFocus
        />
        <View className="flex-row justify-end gap-3">
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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};



export default AudioPlayer;