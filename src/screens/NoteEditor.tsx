import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import * as Speech from 'expo-speech';
import * as DocumentPicker from 'expo-document-picker';
import { saveNote } from '../utils/storage';
import { NoteType } from '../types/note';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { debounce } from '../hooks/useDebounce';

interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  heading: "H1" | "H2" | "H3" | "";
  color: string;
}

interface FormattedText {
  text: string;
  formats: TextFormat[];
}

interface NoteEditorProps {
  route: { params: { note?: NoteType } };
}

const NoteEditor: React.FC<NoteEditorProps> = ({ route }) => {
  const navigation = useNavigation();
  const textInputRef = useRef<TextInput>(null);
  const note = route.params?.note || null;
  
  // Parse initial content if note exists
  const initialFormattedText: FormattedText = note?.formattedContent 
    ? JSON.parse(note.formattedContent)
    : {
        text: note?.content || '',
        formats: Array((note?.content || '').length).fill({
          bold: false,
          italic: false,
          underline: false,
          heading: "",
          color: "#000000",
        })
      };

  // Content states
  const [formattedText, setFormattedText] = useState<FormattedText>(initialFormattedText);
  const [title, setTitle] = useState(note?.title || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const [audioUri, setAudioUri] = useState<string | undefined>(note?.audioUri);
  const [slideUri, setSlideUri] = useState<string | undefined>(note?.slideUri);
  
  // Current selection and formatting
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [currentFormat, setCurrentFormat] = useState<TextFormat>({
    bold: false,
    italic: false,
    underline: false,
    heading: "",
    color: "#000000",
  });
  const [activeFormat, setActiveFormat] = useState<TextFormat | null>(null);

  // History states for undo/redo
  const [history, setHistory] = useState<FormattedText[]>([initialFormattedText]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Update history when content changes
  const updateHistory = useCallback(
    debounce((newFormattedText: FormattedText) => {
      if (JSON.stringify(newFormattedText) !== JSON.stringify(history[historyIndex])) {
        const newHistory = [...history.slice(0, historyIndex + 1), newFormattedText];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500),
    [history, historyIndex]
  );

  useEffect(() => {
    updateHistory(formattedText);
  }, [formattedText, updateHistory]);

  // Handle text selection changes
  const handleSelectionChange = ({ nativeEvent: { selection } }: any) => {
    setSelection(selection);
    
    // If there's a selection, find the common format for all selected characters
    if (selection.start !== selection.end) {
      const selectedFormats = formattedText.formats.slice(selection.start, selection.end);
      const commonFormat = selectedFormats.reduce((acc, format) => ({
        bold: acc.bold && format.bold,
        italic: acc.italic && format.italic,
        underline: acc.underline && format.underline,
        heading: acc.heading === format.heading ? acc.heading : "",
        color: acc.color === format.color ? acc.color : "#000000",
      }), {
        bold: true,
        italic: true,
        underline: true,
        heading: selectedFormats[0]?.heading || "",
        color: selectedFormats[0]?.color || "#000000",
      });

      setCurrentFormat(commonFormat);
    } else {
      // For cursor position, use the format at the cursor position
      const cursorFormat = formattedText.formats[selection.start] || {
        bold: false,
        italic: false,
        underline: false,
        heading: "",
        color: "#000000",
      };
      setCurrentFormat(cursorFormat);
    }
  };

  // Apply formatting to selected text or set active format for new text
  const applyFormatting = (formatChanges: Partial<TextFormat>) => {
    const newFormat = { ...currentFormat, ...formatChanges };
    setCurrentFormat(newFormat);
    
    // Set this as the active format for new text
    setActiveFormat(newFormat);

    if (selection.start !== selection.end) {
      // Apply to selected text
      const newFormats = [...formattedText.formats];
      for (let i = selection.start; i < selection.end; i++) {
        newFormats[i] = { ...newFormats[i], ...formatChanges };
      }
      setFormattedText({
        ...formattedText,
        formats: newFormats,
      });
    }
  };

  // Clear all active formatting
  const clearFormatting = () => {
    setActiveFormat(null);
    applyFormatting({
      bold: false,
      italic: false,
      underline: false,
      heading: "",
      color: "#000000",
    });
  };

  // Handle text changes and apply formatting to new text
  const handleTextChange = (text: string) => {
    if (text.length > formattedText.text.length) {
      // Text was added
      const addedLength = text.length - formattedText.text.length;
      const addedText = text.slice(selection.start, selection.start + addedLength);
      
      const newFormats = [...formattedText.formats];
      // Remove formats for deleted text (if any)
      newFormats.splice(selection.start, text.length - formattedText.text.length);
      
      // Use active format if available, otherwise use current format at cursor position
      const formatToApply = activeFormat || currentFormat;
      
      // Insert new formats for added text
      newFormats.splice(selection.start, 0, ...Array(addedLength).fill(formatToApply));
      
      setFormattedText({
        text,
        formats: newFormats,
      });
    } else if (text.length < formattedText.text.length) {
      // Text was deleted
      const newFormats = [...formattedText.formats];
      newFormats.splice(selection.start, formattedText.text.length - text.length);
      setFormattedText({
        text,
        formats: newFormats,
      });
    } else {
      // Text might have been replaced
      setFormattedText(prev => ({
        ...prev,
        text,
      }));
    }
  };

  // Get style object for a format
  const getStyle = (format: TextFormat) => {
    let style: any = {
      color: format.color,
      fontSize: 16, // Default size
    };
    if (format.bold) style.fontWeight = "bold";
    if (format.italic) style.fontStyle = "italic";
    if (format.underline) style.textDecorationLine = "underline";

    switch (format.heading) {
      case "H1":
        style.fontSize = 24;
        style.fontWeight = "bold";
        break;
      case "H2":
        style.fontSize = 20;
        style.fontWeight = "bold";
        break;
      case "H3":
        style.fontSize = 18;
        style.fontWeight = "bold";
        break;
    }

    return style;
  };

  // Render the formatted text as a preview
  const renderFormattedPreview = () => {
    if (!formattedText.text) {
      return (
        <Text className="p-4 text-lg text-gray-400">
          Type your note here...
        </Text>
      );
    }

    const elements = [];
    let currentStyle = getStyle(formattedText.formats[0]);
    let currentText = formattedText.text[0];

    for (let i = 1; i < formattedText.text.length; i++) {
      const char = formattedText.text[i];
      const style = getStyle(formattedText.formats[i]);

      if (JSON.stringify(style) === JSON.stringify(currentStyle)) {
        currentText += char;
      } else {
        elements.push(
          <Text key={`text-${i-1}`} style={currentStyle}>
            {currentText}
          </Text>
        );
        currentStyle = style;
        currentText = char;
      }
    }

    if (currentText) {
      elements.push(
        <Text key={`text-end`} style={currentStyle}>
          {currentText}
        </Text>
      );
    }

    return (
      <Text className="p-4 text-lg" selectable>
        {elements}
      </Text>
    );
  };

  // Text-to-speech function
  const readAloud = () => {
    Speech.speak(formattedText.text, { language: 'en', rate: 1.0 });
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFormattedText(history[historyIndex - 1]);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFormattedText(history[historyIndex + 1]);
    }
  };

  // Check if undo/redo is possible
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Document picker for slides
  const pickSlide = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.type === 'success') {
      setSlideUri(result.uri);
    }
  };

  // Save note function with formatted content
  const handleSave = async () => {
    const newNote: NoteType = {
      id: note?.id || Date.now().toString(),
      title,
      content: formattedText.text,
      formattedContent: JSON.stringify(formattedText),
      tags: tags.split(',').map(tag => tag.trim()),
      audioUri,
      slideUri,
      timestamp: new Date().toISOString(),
    };
    await saveNote(newNote);
    navigation.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const clearContent = () => {
    setFormattedText({
      text: "",
      formats: [],
    });
    setActiveFormat(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="w-full flex-row justify-between items-center p-4">
        <View className="flex flex-row gap-4 items-center">
          <Ionicons name="arrow-back-sharp" size={24} color="#8a817c" onPress={handleBack} />
          <Text className="text-text font-bold text-2xl">Notes</Text>
        </View>

        <View className="flex flex-row gap-4 items-center">
          <TouchableOpacity onPress={handleUndo} disabled={!canUndo}>
            <Ionicons
              name="arrow-undo"
              size={24}
              color="#8a817c"
              style={{ opacity: canUndo ? 1 : 0.5 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRedo} disabled={!canRedo}>
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

      {/* Title Input */}
      <TextInput
        className="p-4 font-bold rounded-lg text-2xl text-text"
        placeholder="Title"
        placeholderTextColor="#8a817c"
        value={title}
        onChangeText={setTitle}
      />

      {/* Content Editor */}
      <View className="flex-1">
        {/* Hidden TextInput for actual text entry */}
        <TextInput
          ref={textInputRef}
          className="absolute opacity-0 h-0 w-0"
          value={formattedText.text}
          onChangeText={handleTextChange}
          onSelectionChange={handleSelectionChange}
          multiline
        />
        
        {/* Formatted text preview */}
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1}
          onPress={() => textInputRef.current?.focus()}
        >
          {renderFormattedPreview()}
        </TouchableOpacity>
      </View>

      {/* Formatting Toolbar */}
      <View className="flex-col gap-2 justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
        {/* Text Formatting */}
        <View className="flex-row w-full justify-evenly">
          <TouchableOpacity onPress={() => applyFormatting({ bold: !currentFormat.bold })}>
            <Text className={`font-bold text-h2 ${currentFormat.bold ? "text-blue-500" : "text-gray-700"}`}>B</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => applyFormatting({ underline: !currentFormat.underline })}>
            <Text className={`underline text-h2 ${currentFormat.underline ? "text-blue-500" : "text-gray-700"}`}>U</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => applyFormatting({ italic: !currentFormat.italic })}>
            <Text className={`italic text-h2 ${currentFormat.italic ? "text-blue-500" : "text-gray-700"}`}>/</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => applyFormatting({ heading: currentFormat.heading === "H1" ? "" : "H1" })}>
            <Text className={`font-bold ${currentFormat.heading === "H1" ? "text-blue-500" : "text-gray-700"}`}>H1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => applyFormatting({ heading: currentFormat.heading === "H2" ? "" : "H2" })}>
            <Text className={`font-bold ${currentFormat.heading === "H2" ? "text-blue-500" : "text-gray-700"}`}>H2</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => applyFormatting({ heading: currentFormat.heading === "H3" ? "" : "H3" })}>
            <Text className={`font-bold ${currentFormat.heading === "H3" ? "text-blue-500" : "text-gray-700"}`}>H3</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={clearFormatting}>
            <MaterialCommunityIcons 
              name="format-clear" 
              size={20} 
              color={
                currentFormat.bold || currentFormat.italic || currentFormat.underline || 
                currentFormat.heading || currentFormat.color !== "#000000" 
                  ? "#3b82f6" 
                  : "#8a817c"
              } 
            />
          </TouchableOpacity>
        </View>

        {/* Color Options */}
        <View className="flex-row w-full justify-evenly mt-2">
          {["#000000", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"].map(color => (
            <TouchableOpacity
              key={color}
              className={`w-6 h-6 rounded-full ${color === currentFormat.color ? "border-2 border-blue-500" : ""}`}
              style={{ backgroundColor: color }}
              onPress={() => applyFormatting({ color })}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View className="flex-row w-full justify-evenly mt-4">
          <TouchableOpacity 
            className="flex-row items-center gap-1 p-2 rounded-lg bg-gray-200"
            onPress={readAloud}
          >
            <MaterialCommunityIcons name="text-to-speech" size={20} color="#8a817c" />
            <Text className="text-gray-700">Read Aloud</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center gap-1 p-2 rounded-lg bg-gray-200"
            onPress={pickSlide}
          >
            <MaterialCommunityIcons name="file-import" size={20} color="#8a817c" />
            <Text className="text-gray-700">Import Slide</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center gap-1 p-2 rounded-lg bg-gray-200"
            onPress={clearContent}
          >
            <MaterialCommunityIcons name="broom" size={20} color="#8a817c" />
            <Text className="text-gray-700">Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NoteEditor;