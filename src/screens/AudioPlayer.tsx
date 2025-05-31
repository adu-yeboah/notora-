import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
// import Slider from '../components/slider';
import Heading from '../components/ui/heading';
import { deleteRecord } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { RecordType } from '../types/note';
import Slider from '@react-native-community/slider';

interface AudioPlayerProps {
  route: {
    params: RecordType
  };
}

const AudioPlayer = ({ route }: AudioPlayerProps) => {
  const { uri, name, id } = route.params;
  const navigation = useNavigation()

  const player = useAudioPlayer({ uri });
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(player.duration);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isLoading, setIsLoading] = useState(true);

  const [isSeeking, setIsSeeking] = useState(false);

  
  // Initialize player and set up listeners
  useMemo(() => {
    const initializePlayer = async () => {
      try {
        setDuration(player.duration);
        setIsLoading(false);
      } catch (error) {
        console.error('Player initialization error:', error);
        Alert.alert('Error', 'Failed to initialize audio player');
      }
    };

    initializePlayer();

    const updateInterval = setInterval(() => {
      if (player.playing) {
        setPosition(player.currentTime);
      }
    }, 250);

    return () => {
      clearInterval(updateInterval);
      player.release();
    };
  }, []);

  // Handle playback state changes
  useEffect(() => {
    console.log("j");

    setIsPlaying(player.playing);
  }, [player.playing]);


  const togglePlayback = () => {
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
    try {
      await player.seekTo(value);
      setPosition(value);
      setIsSeeking(false);
      if (isPlaying) {
        await player.play();
      }
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const handleSliderValueChange = (value: number) => {
    setIsSeeking(true);
    setPosition(value);
  };

  const handleSliderSlidingStart = () => {
    setIsSeeking(true);
    if (isPlaying) {
      player.pause();
    }
  };



  const changePlaybackRate = async (rate: number) => {
    try {
      await player.setPlaybackRate(rate);
      setPlaybackRate(rate);
    } catch (error) {
      console.error('Playback rate error:', error);
    }
  };

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

  const handleRename = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    // try {
    //   await updateRecord(id, { name: newName });
    //   setShowRenameModal(false);
    //   navigation.setParams({ name: newName });
    // } catch (error) {
    //   console.error('Rename error:', error);
    //   Alert.alert('Error', 'Failed to rename recording');
    // }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4 justify-center items-center">
        <Text>Loading audio...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Heading />
      <View className="bg-secondary rounded-xl p-6 mb-8 flex-1">
        <Text className="text-2xl font-bold text-center mb-2" numberOfLines={1}>
          {name}
        </Text>

        <View className="h-24 bg-gray-100 rounded-lg my-6 justify-center items-center">
          <Text className="text-gray-500">Waveform Visualization</Text>
        </View>

        <View className="mb-4">
          <View className="flex-row justify-between mb-1">
            <Text>{formatTime(position)}</Text>
            <Text>{formatTime(duration)}</Text>
          </View>
          <Slider
            value={position}
            minimumValue={0}
            maximumValue={duration}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#3b82f6"
            onValueChange={handleSliderValueChange}
            onSlidingStart={handleSliderSlidingStart}
            onSlidingComplete={handleSeek}
          />
        </View>

        <View className="flex-row justify-center items-center space-x-8 mb-6">
          {[0.5, 1.0, 1.5, 2.0].map((rate) => (
            <TouchableOpacity
              key={rate.toString()}
              onPress={() => changePlaybackRate(rate)}
            >
              <Text
                className={`text-lg ${playbackRate === rate ? 'text-blue-500 font-bold' : 'text-gray-500'}`}
              >
                {rate}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-center items-center space-x-12">
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-full"
            onPress={togglePlayback}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-around">
        <TouchableOpacity
          className="flex items-center"
          onPress={() => setShowRenameModal(true)}
        >
          <Ionicons name="pencil-outline" size={24} color="gray" />
          <Text className="text-gray-600 mt-1">Rename</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex items-center"
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
          <Text className="text-red-600 mt-1">Delete</Text>
        </TouchableOpacity>
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
}

interface RenameModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  onChangeName: (text: string) => void;
  onSave: () => void;
};

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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default AudioPlayer;