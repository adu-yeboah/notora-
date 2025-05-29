import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import Slider from '../components/slider';

const AudioPlayer = ({ route, navigation }) => {
  const { uri, name, onDelete, onRename } = route.params;
  const player = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(name);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        player.replace({ uri });
        const status = await player.getStatusAsync();
        setDuration(status.durationMillis / 1000);
        
        const subscription = player.addListener('playbackStatusUpdate', (status) => {
          setPosition(status.positionMillis / 1000);
          if (!status.isPlaying && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
        
        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Playback error:', error);
        Alert.alert('Error', 'Failed to load recording');
      }
    };

    loadAudio();

    return () => {
      player.pause();
    };
  }, [uri]);

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback toggle error:', error);
    }
  };

  const handleSeek = async (value: number) => {
    try {
      await player.setPositionAsync(value * 1000);
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const changePlaybackRate = async (rate: number) => {
    try {
      await player.setRateAsync(rate, true);
      setPlaybackRate(rate);
    } catch (error) {
      console.error('Rate change error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          onDelete();
          navigation.goBack();
        }},
      ]
    );
  };

  const handleRename = () => {
    onRename(newName);
    setShowRenameModal(false);
  };

  return (
    <View className="flex-1 bg-background p-6">
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="gray" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Now Playing</Text>
        <View style={{ width: 32 }} />
      </View>

      <View className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <Text className="text-2xl font-bold text-center mb-2" numberOfLines={1}>{name}</Text>
        
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
            onSlidingComplete={handleSeek}
          />
        </View>
        
        <View className="flex-row justify-center items-center space-x-8 mb-6">
          <TouchableOpacity onPress={() => changePlaybackRate(0.5)}>
            <Text className={`text-lg ${playbackRate === 0.5 ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>0.5x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changePlaybackRate(1.0)}>
            <Text className={`text-lg ${playbackRate === 1.0 ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>1.0x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changePlaybackRate(1.5)}>
            <Text className={`text-lg ${playbackRate === 1.5 ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>1.5x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changePlaybackRate(2.0)}>
            <Text className={`text-lg ${playbackRate === 2.0 ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>2.0x</Text>
          </TouchableOpacity>
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
      
      <View className="flex-row justify-center space-x-8">
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
          <Text className="text-red-500 mt-1">Delete</Text>
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

const RenameModal = ({ visible, onClose, name, onChangeName, onSave }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
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