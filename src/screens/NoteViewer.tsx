import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Audio from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { deleteNote } from '../utils/storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

const NoteViewer = ({ route }) => {
  const { note } = route.params || {};
  const navigation = useNavigation();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [currentSentence, setCurrentSentence] = useState('');
  const speechProgressRef = useRef(0);
  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  
  // Parse formatted content
  const formattedContent = note?.formattedContent ? JSON.parse(note.formattedContent) : null;
  const totalWords = note?.content?.split(' ').length || 0;

  // Verify note exists
  if (!note) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">Note not found</Text>
      </View>
    );
  }

  // Initialize sentences when note changes
  useEffect(() => {
    if (note?.content) {
      sentencesRef.current = note.content.split(/(?<=[.!?])\s+/);
      currentIndexRef.current = 0;
    }
  }, [note]);

  // Clean up resources
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
      Speech.stop().catch(console.error);
    };
  }, [sound]);

  // Handle audio position updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sound && isPlaying) {
      interval = setInterval(async () => {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
          }
        } catch (error) {
          console.error('Error getting audio status:', error);
        }
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  // Format time display
  const formatTime = (millis: number) => {
    if (isNaN(millis)) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Text-to-speech functions
  const readAloud = async () => {
    if (!note?.content) return;
    
    if (isSpeaking) {
      try {
        await Speech.stop();
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
      setIsSpeaking(false);
      setCurrentSentence('');
      return;
    }

    setIsSpeaking(true);
    setSpeechProgress(0);
    speechProgressRef.current = 0;
    currentIndexRef.current = 0;

    try {
      while (currentIndexRef.current < sentencesRef.current.length && isSpeaking) {
        const sentence = sentencesRef.current[currentIndexRef.current];
        setCurrentSentence(sentence);
        
        const wordCount = sentence.split(' ').length;
        await new Promise<void>(async (resolve) => {
          try {
            await Speech.speak(sentence, {
              language: 'en',
              rate: playbackRate,
              onDone: () => {
                currentIndexRef.current += 1;
                const wordsSoFar = sentencesRef.current
                  .slice(0, currentIndexRef.current)
                  .join(' ')
                  .split(' ').length;
                speechProgressRef.current = (wordsSoFar / totalWords) * 100;
                setSpeechProgress(speechProgressRef.current);
                resolve();
              },
              onStopped: resolve,
              onError: resolve,
            });
          } catch (error) {
            console.error('Error speaking:', error);
            resolve();
          }
        });
      }
    } catch (error) {
      console.error('Error in readAloud:', error);
    } finally {
      setIsSpeaking(false);
      setCurrentSentence('');
    }
  };




  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
    
    if (isSpeaking) {
      Speech.stop().then(readAloud).catch(console.error);
    }
  };

  const handleEdit = () => {
    navigation.navigate('NoteEditor', { note });
  };

  const exportToPDF = async () => {
    try {
      if (!note?.content) return;

      // Create HTML content with proper structure
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${note.title || 'Untitled Note'}</title>
            <style>
              body { font-family: Arial; padding: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .content { white-space: pre-wrap; margin-top: 20px; }
              .tags { margin-top: 20px; }
              .tag { display: inline-block; background: #eee; padding: 3px 8px; border-radius: 3px; margin-right: 5px; }
              .date { color: #666; font-size: 0.9em; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${note.title || 'Untitled Note'}</h1>
            <div class="content">${note.content.replace(/\n/g, '<br>')}</div>
            ${note.tags?.length > 0 ? `
              <div class="tags">
                ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
              </div>
            ` : ''}
            <div class="date">${new Date(note.timestamp || Date.now()).toLocaleString()}</div>
          </body>
        </html>
      `;

      // Use expo-print to generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 612,  // 8.5 inches in points (standard US letter width)
        height: 792, // 11 inches in points (standard US letter height)
        base64: false
      });

      // Share the generated PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Note as PDF',
          UTI: 'com.adobe.pdf' // iOS only
        });
      } else {
        Alert.alert('Success', `PDF saved to: ${uri}`);
      }

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      Alert.alert('Error', 'Failed to create PDF: ' + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(note.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  // Highlight currently spoken sentence
  const renderFormattedText = () => {
    if (!formattedContent) {
      return (
        <Text className="text-base text-gray-800">
          {note.content.split('\n').map((paragraph, i) => (
            <Text key={i}>
              {paragraph.split(' ').map((word, j) => (
                <Text 
                  key={j} 
                  className={
                    isSpeaking && currentSentence.includes(word) ? 
                    "bg-yellow-100" : ""
                  }
                >
                  {word}{' '}
                </Text>
              ))}
              {'\n\n'}
            </Text>
          ))}
        </Text>
      );
    }

    return formattedContent.text.split('\n').map((paragraph, i) => (
      <Text key={i}>
        {paragraph.split(' ').map((word, j) => {
          const format = formattedContent.formats[i] || {
            bold: false,
            italic: false,
            underline: false,
            heading: "",
            color: "#000000"
          };

          const textStyle = [
            format.color === "#ef4444" ? "text-red-500" : "text-gray-800",
            format.bold ? "font-bold" : "",
            format.italic ? "italic" : "",
            format.underline ? "underline" : "",
            format.heading === "H1" ? "text-2xl font-bold" : 
            format.heading === "H2" ? "text-xl font-bold" : 
            format.heading === "H3" ? "text-lg font-bold" : "text-base",
            isSpeaking && currentSentence.includes(word) ? "bg-yellow-100" : ""
          ].join(' ');

          return (
            <Text key={j} className={textStyle}>
              {word}{' '}
            </Text>
          );
        })}
        {'\n\n'}
      </Text>
    ));
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          {note.title || 'Untitled Note'}
        </Text>
        
        <View className="mb-4">
          {renderFormattedText()}
        </View>
      </ScrollView>

     

      {isSpeaking && (
        <View className="mb-4 px-4">
          <Text className="text-center text-gray-600 mb-1">
            Reading: {Math.round(speechProgress)}% complete
          </Text>
          <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <View 
              className="h-full bg-blue-500" 
              style={{ width: `${speechProgress}%` }}
            />
          </View>

          <Text className="text-center text-gray-600 mt-2 italic">
            {currentSentence.length > 50 ? 
              `${currentSentence.substring(0, 50)}...` : 
              currentSentence}
          </Text>
        </View>
      )}

      <View className="flex-row justify-around py-4 border-t border-gray-200 bg-white absolute bottom-0 left-0 right-0">
        <TouchableOpacity 
          className="items-center"
          onPress={readAloud}
          disabled={!note.content}
        >
          <Ionicons 
            name={isSpeaking ? "stop" : "volume-high"} 
            size={24} 
            color={isSpeaking ? "#ef4444" : note.content ? "#3b82f6" : "#9ca3af"} 
          />
          <Text className={`text-xs mt-1 ${!note.content ? "text-gray-400" : "text-gray-700"}`}>
            {isSpeaking ? "Stop" : "Read"}
          </Text>
        </TouchableOpacity>

        {note.audioUri && (
          <TouchableOpacity 
            className="items-center"
            onPress={playAudio}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#3b82f6" 
            />
            <Text className="text-xs mt-1 text-gray-700">
              {isPlaying ? "Pause" : "Play"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          className="items-center"
          onPress={changePlaybackRate}
          disabled={!note.content && !note.audioUri}
        >
          <MaterialCommunityIcons 
            name="speedometer" 
            size={24} 
            color={(note.content || note.audioUri) ? "#3b82f6" : "#9ca3af"} 
          />
          <Text className={`text-xs mt-1 ${(!note.content && !note.audioUri) ? "text-gray-400" : "text-gray-700"}`}>
            {playbackRate}x
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center"
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={24} color="#3b82f6" />
          <Text className="text-xs mt-1 text-gray-700">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center"
          onPress={exportToPDF}
          disabled={!note.content}
        >
          <MaterialCommunityIcons 
            name="file-pdf-box" 
            size={24} 
            color={note.content ? "#3b82f6" : "#9ca3af"} 
          />
          <Text className={`text-xs mt-1 ${!note.content ? "text-gray-400" : "text-gray-700"}`}>
            PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center"
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={24} color="#ef4444" />
          <Text className="text-xs mt-1 text-gray-700">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NoteViewer;