import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types/navigation';

const DocumentViewer = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'DocumentViewer'>>();
    const { fileUri, fileName, fileType } = route.params;
    
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const extractText = async () => {
            try {
                if (fileType === 'text/plain') {
                    const content = await FileSystem.readAsStringAsync(fileUri);
                    setTextContent(content);
                } else if (fileType === 'application/pdf') {
                    // For PDF, we'll just show a message - consider using react-native-pdf for actual rendering
                    setTextContent(`PDF file: ${fileName}\n\nFor better PDF viewing, consider using a dedicated PDF viewer library.`);
                } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    setTextContent(`DOCX file: ${fileName}\n\nFor DOCX viewing, consider using a document viewer library.`);
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to read document content');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        extractText();

        return () => {
            // Stop any speech when component unmounts
            Speech.stop();
        };
    }, [fileUri, fileType, fileName]);

    const handlePrint = async () => {
        try {
            await Print.printAsync({
                html: `<html><body><pre>${textContent}</pre></body></html>`,
                printerUrl: 'Select printer...'
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to print document');
            console.error(error);
        }
    };

    const handleShare = async () => {
        try {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Sharing not available on this platform');
                return;
            }

            await Sharing.shareAsync(fileUri, {
                dialogTitle: 'Share Document',
                mimeType: fileType,
                UTI: fileType
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share document');
            console.error(error);
        }
    };

    const toggleTextToSpeech = () => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            if (textContent) {
                setIsSpeaking(true);
                Speech.speak(textContent, {
                    onDone: () => setIsSpeaking(false),
                    onStopped: () => setIsSpeaking(false),
                    onError: () => setIsSpeaking(false)
                });
            } else {
                Alert.alert('No content', 'There is no text content to read');
            }
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Loading document...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background p-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#3b82f6" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-800" numberOfLines={1} ellipsizeMode="middle">
                    {fileName}
                </Text>
                <View className="flex-row space-x-4">
                    <TouchableOpacity onPress={handlePrint}>
                        <MaterialIcons name="print" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare}>
                        <MaterialIcons name="share" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Document Content */}
            <ScrollView className="flex-1 bg-white p-4 rounded-lg mb-4">
                <Text className="text-gray-800" selectable>
                    {textContent || 'No content available'}
                </Text>
            </ScrollView>

            {/* Text-to-Speech Button */}
            <TouchableOpacity 
                className={`px-6 py-3 rounded-full flex-row justify-center items-center ${
                    isSpeaking ? 'bg-red-500' : 'bg-blue-500'
                }`}
                onPress={toggleTextToSpeech}
            >
                <MaterialIcons 
                    name={isSpeaking ? 'stop' : 'volume-up'} 
                    size={20} 
                    color="white" 
                />
                <Text className="text-white ml-2">
                    {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default DocumentViewer;