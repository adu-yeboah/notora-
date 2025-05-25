import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import * as Audio from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { saveNote } from '../utils/storage';
import { AdMobInterstitial } from 'expo-ads-admob';
import Toolbar from '../components/toolBar';
import { NoteType } from '../types/note';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { debounce } from '../hooks/useDebounce';
// import { useNavigation } from '@react-navigation/native';

interface NoteEditorProps {
  route: { params: { note?: NoteType } };
}

// const navigation = useNavigation()/
const NoteEditor: React.FC<NoteEditorProps> = ({ route }) => {
  const note = route.params?.note || null;
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  // const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | undefined>(note?.audioUri);
  const [slideUri, setSlideUri] = useState<string | undefined>(note?.slideUri);

  const readAloud = () => {
    Speech.speak(content, { language: 'en', rate: 1.0 });
  };


  // History states for undo/redo
  const [titleHistory, setTitleHistory] = useState<string[]>([title]);
  const [contentHistory, setContentHistory] = useState<string[]>([content]);
  const [titleHistoryIndex, setTitleHistoryIndex] = useState<number>(0);
  const [contentHistoryIndex, setContentHistoryIndex] = useState<number>(0);

// Debounced history update for title
  const updateTitleHistory = useCallback(
    debounce((newTitle: string) => {
      if (newTitle !== titleHistory[titleHistoryIndex]) {
        const newHistory = [...titleHistory.slice(0, titleHistoryIndex + 1), newTitle];
        setTitleHistory(newHistory);
        setTitleHistoryIndex(newHistory.length - 1);
      }
    }, 500), // 500ms delay
    [titleHistory, titleHistoryIndex]
  );

  // Debounced history update for content
  const updateContentHistory = useCallback(
    debounce((newContent: string) => {
      if (newContent !== contentHistory[contentHistoryIndex]) {
        const newHistory = [...contentHistory.slice(0, contentHistoryIndex + 1), newContent];
        setContentHistory(newHistory);
        setContentHistoryIndex(newHistory.length - 1);
      }
    }, 500), // 500ms delay
    [contentHistory, contentHistoryIndex]
  );

  // Update history when title changes
  useEffect(() => {
    updateTitleHistory(title);
  }, [title, updateTitleHistory]);

  // Update history when content changes
  useEffect(() => {
    updateContentHistory(content);
  }, [content, updateContentHistory]);

  // Undo Function
  const handleUndo = () => {
    if (titleHistoryIndex > 0) {
      setTitleHistoryIndex(titleHistoryIndex - 1)
      setTitle(titleHistory[titleHistoryIndex - 1])
    }
    if (contentHistoryIndex > 0) {
      setContentHistoryIndex(contentHistoryIndex - 1)
      setContent(contentHistory[contentHistoryIndex - 1])
    }
  }
  // Redo Function
  const handleRedo = () => {
    if (titleHistoryIndex < titleHistory.length - 1) {
      setTitleHistoryIndex(titleHistoryIndex + 1)
      setTitle(titleHistory[titleHistoryIndex + 1])
    }
    if (contentHistoryIndex < titleHistory.length - 1) {
      setContentHistoryIndex(contentHistoryIndex + 1)
      setContent(contentHistory[contentHistoryIndex + 1])
    }
  }

  // Check if undo/redo is possible
  const canUndo = titleHistoryIndex > 0 || contentHistoryIndex > 0;
  const canRedo = titleHistoryIndex < titleHistory.length - 1 || contentHistoryIndex < contentHistory.length - 1;


  // const startRecording = async () => {
  //   const { granted } = await Audio.requestPermissionsAsync();
  //   if (granted) {
  //     const { recording } = await Audio?.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  //     setRecording(recording);
  //   }
  // };

  // const stopRecording = async () => {
  //   await recording?.stopAndUnloadAsync();
  //   setAudioUri(recording?.getURI());
  //   setRecording(null);
  // };

  // const pickSlide = async () => {
  //   const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
  //   if (result.type === 'success') {
  //     setSlideUri(result.uri);
  //     navigation.navigate('SlideImporter', { uri: result.uri, onExtract: (text: string) => setContent(content + '\n' + text) });
  //   }
  // };

  const handleSave = async () => {
    const newNote: NoteType = {
      id: note?.id || Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()),
      audioUri,
      slideUri,
      timestamp: new Date().toISOString(),
    };
    await saveNote(newNote);
    // await AdMobInterstitial.setAdUnitID('ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz');
    // await AdMobInterstitial.requestAdAsync();
    // await AdMobInterstitial.showAdAsync();
    // navigation.goBack();
  };


  const navigation = useNavigation();
  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <View className='flex-1 p-4 bg-background'>
      <View className='w-full flex-row flex justify-between'>

        <View className='flex flex-row gap-4 items-center'>
          <Ionicons name="arrow-back-sharp" size={24} color="#8a817c" onPress={handleBack} />
          <Text className='text-text font-bold text-2xl'>
            Notes
          </Text>
        </View>

        <View className='flex flex-row gap-5'>
          <TouchableOpacity
            onPress={handleUndo}
            disabled={!canUndo}
          >
            <Ionicons
              name="arrow-undo"
              size={24}
              color="#8a817c"
              style={{ opacity: canUndo ? 1 : 0.5 }}

            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedo}
            disabled={!canRedo}
          >
            <Ionicons
              name="arrow-redo"
              size={24}
              color="#8a817c"
              style={{ opacity: canRedo ? 1 : 0.5 }}

            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave}>
            <AntDesign name="check" size={24} color="#8a817c" />
          </TouchableOpacity>
        </View>

      </View>
      <View className='flex flex-col flex-1'>
        <TextInput
          className='p-2 font-bold rounded-lg my-2 text-2xl text-text'
          placeholder="Title"
          placeholderTextColor="#8a817c"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          className='p-2 flex-1 rounded-lg my-2 h-48 text-lg text-text align-top'
          placeholder="Type your note here"
          placeholderTextColor="#8a817c"
          value={content}
          onChangeText={setContent}
          multiline
        />
      </View>
      <Toolbar
        // onFormat={() => { }} // Add formatting logic
        // onCamera={pickSlide}
        // onRecord={recording ? stopRecording : startRecording}
        onTTS={readAloud}
        onTag={() => { }} // Already handled by tags input
      />
    </View>
  );
};

export default NoteEditor;