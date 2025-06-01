
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import Heading from '../components/ui/heading';
import { deleteRecord } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { RecordType } from '../types/note';
import Slider from '@react-native-community/slider';

interface AudioPlayerProps {
  route: {
    params: RecordType;
  };
}

const AudioPlayer = ({ route }: AudioPlayerProps) => {
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

  // Validate URI and initialize player at top level
  // if (!uri || typeof uri !== 'string') {
  //   console.error('Invalid URI:', uri);
  //   Alert.alert('Error', 'Invalid audio source provided. URI must be a string.');
  //   return (
  //     <View className="flex-1 bg-background p-4 justify-center items-center">
  //       <Text>Invalid audio source</Text>
  //     </View>
  //   );
  // }

  const player = useAudioPlayer(uri);

  // Initialize player and set duration
  useEffect(() => {
    const initializePlayer = async () => {
      if (!player) {
        setIsLoading(false);
        return;
      }
      try {
        if (!player.isLoaded) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure player readiness
        }
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

  // Update playback position
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (player && player.playing && !isSeeking) {
        setPosition(player.currentTime || 0);
      }
    }, 250);

    return () => clearInterval(updateInterval);
  }, [player, isPlaying, isSeeking]);

  // Sync playing state
  useEffect(() => {
    if (player) {
      setIsPlaying(player.playing);
    }
  }, [player?.playing]);

  const togglePlayback = async () => {
    if (!player || !player.isLoaded) return;
    try {
      if (player.playing) {
        await player.pause();
      } else {
        await player.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to toggle playback');
    }
  };

  const handleSeek = async (value: number) => {
    if (!player || !player.isLoaded) return;
    try {
      await player.seekTo(value);
      setPosition(value);
      setIsSeeking(false);
      if (isPlaying) {
        await player.play();
      }
    } catch (error) {
      console.error('Seek error:', error);
      Alert.alert('Error', 'Failed to seek audio');
    }
  };

  const handleSliderValueChange = (value: number) => {
    setIsSeeking(true);
    setPosition(value);
  };

  const handleSliderSlidingStart = async () => {
    setIsSeeking(true);
    if (player && isPlaying && player.isLoaded) {
      await player.pause();
    }
  };

  const changePlaybackRate = async (rate: number) => {
    if (!player || !player.isLoaded) return;
    try {
      await player.setPlaybackRate(rate, 'medium');
      setPlaybackRate(rate);
    } catch (error) {
      console.error('Playback rate error:', error);
      Alert.alert('Error', 'Failed to change playback rate');
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
    // Implement updateRecord logic here
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

  if (!player || !player.isLoaded) {
    return (
      <View className="flex-1 bg-background p-4 justify-center items-center">
        <Text>Failed to load audio player</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Heading />
      <View className="bg-secondary rounded-xl p-6 mb-8 flex-1">
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

        <View className="mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className='text-secondaryText'>{formatTime(position)}</Text>
            <Text className='text-secondaryText'>{formatTime(duration)}</Text>
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

      <View className="flex-row justify-around flex-1">
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
