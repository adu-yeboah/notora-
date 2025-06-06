import { View, Text, Image, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Heading from '../components/ui/heading';

// 1. Define your root stack param list
type RootStackParamList = {
  DocumentViewer: {
    fileUri: string;
    fileName: string;
    fileType: string;
  };
  Recorder: undefined;
  NoteEditor: { note: null };
  Settings: undefined;
};

// 2. Create navigation prop type
type AddScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const MAX_FILE_SIZE_MB = 10;

export default function Add() {
  // 3. Use the properly typed navigation hook
  const navigation = useNavigation<AddScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = async () => {
    console.log('Starting document picker...');
    setIsLoading(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];

        // Validate file size
        if (file.size && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          Alert.alert('Error', `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
          return;
        }

        let fileUri = file.uri;

        // Handle Android content URIs
        if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
          try {
            const cacheDir = FileSystem.cacheDirectory;
            const newPath = `${cacheDir}${file.name}`;

            await FileSystem.copyAsync({
              from: fileUri,
              to: newPath,
            });
            fileUri = newPath;
          } catch (copyError) {
            console.error('File copy error:', copyError);
            Alert.alert('Error', 'Failed to prepare document for viewing');
            return;
          }
        }

        // Ensure proper URI format
        if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
          fileUri = `file://${fileUri}`;
        }

        // Navigate with file data
        navigation.navigate('DocumentViewer', {
          fileUri,
          fileName: file.name,
          fileType: file.mimeType || 'application/octet-stream'
        });
      }
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View className="flex-1 bg-background p-4">
      {/* Header with Back Button and Logo */}
      <View className="flex-row justify-between items-center mb-6">
        <Heading />
      </View>

      {/* Action Buttons Grid */}
      <View className="flex-row flex-wrap justify-between p-2">
        {/* Record Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Recorder')}
          className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-lg items-center border border-border"
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <FontAwesome name="microphone" size={32} color="#3b82f6" />
          <Text className="mt-3 text-lg font-semibold text-gray-800">Record</Text>
        </TouchableOpacity>

        {/* Add Note Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NoteEditor', { note: null })}
          className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-lg items-center border border-border"
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <MaterialIcons name="note-add" size={32} color="#3b82f6" />
          <Text className="mt-3 text-lg font-semibold text-gray-800">Add Note</Text>
        </TouchableOpacity>

        {/* Import File Button with Loading State */}
        <TouchableOpacity
          onPress={pickDocument}
          className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-lg items-center border border-border relative"
          activeOpacity={0.7}
          // disabled={isLoading}
          disabled={true}
        >
          {isLoading && (
            <View className="absolute inset-0 bg-black/20 rounded-xl justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}
          <FontAwesome5 name="file-import" size={32} color="#3b82f6" />
          <Text className="mt-3 text-lg font-semibold text-gray-800">Import</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}