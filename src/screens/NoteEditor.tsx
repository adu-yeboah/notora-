import React, { useState, useEffect } from 'react';
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

  const handleBack = () => {
    // navigation.goBack()
  }

  return (
    <View className='flex-1 p-4 bg-background'>
      <View className='w-full flex-row flex justify-between'>

        <View className='flex flex-row gap-4 items-center'>
          <Ionicons name="arrow-back-sharp" size={24} color="#f4f3ee" onPress={handleBack} />
          <Text className='text-text font-bold text-2xl'>
            Notes
          </Text>
        </View>

        <View className='flex flex-row gap-5'>
          <TouchableOpacity>
            <Ionicons name="arrow-undo" size={24} color="#f4f3ee" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="arrow-redo" size={24} color="#f4f3ee" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave}>
            <AntDesign name="check" size={24} color="#f4f3ee" />
          </TouchableOpacity>
        </View>

      </View>
      <View className='flex flex-col flex-1'>
        <TextInput
          className='p-2 font-bold rounded-lg my-2 text-xlg text-text'
          placeholder="Title"
          placeholderTextColor="#333"
          placeholderClassName='text-2xl'
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          className='p-2 flex-1 rounded-lg my-2 h-48 text-base text-text align-top'
          placeholder="Type your note here"
          placeholderTextColor="#333"
          placeholderClassName='text-md'
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