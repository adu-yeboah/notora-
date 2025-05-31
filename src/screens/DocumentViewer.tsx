import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types/navigation';

// Optional PDF viewer - wrapped in try/catch to prevent crashes
let PDFView;
try {
  PDFView = require('react-native-view-pdf').PDFView;
} catch (e) {
  console.warn('PDF viewer not available:', e);
}

const DocumentViewer = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'DocumentViewer'>>();
    const { fileUri, fileName, fileType } = route.params;
    
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const extractText = async () => {
            try {
                if (fileType === 'text/plain') {
                    const content = await FileSystem.readAsStringAsync(fileUri);
                    setTextContent(content);
                } else if (fileType === 'application/pdf') {
                    // Just set empty content for PDF, we'll handle it separately
                    setTextContent('');
                } else {
                    setTextContent(`File type: ${fileType}\n\nFor better viewing, consider using a dedicated viewer.`);
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
            Speech.stop();
            setIsSpeaking(false);
        };
    }, [fileUri, fileType, fileName]);

    // ... (keep your existing handlePrint, handleShare, toggleTextToSpeech functions)

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
                <Text className="text-lg font-semibold text-gray-800 flex-1 mx-2" numberOfLines={1}>
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
            {fileType === 'application/pdf' ? (
                PDFView ? (
                    <View className="flex-1 bg-white rounded-lg mb-4 overflow-hidden">
                        <PDFView
                            style={{ flex: 1 }}
                            resource={fileUri}
                            resourceType="file"
                            onError={(error) => {
                                console.error('PDF Error:', error);
                                setPdfError(true);
                            }}
                        />
                        {pdfError && (
                            <View className="absolute inset-0 justify-center items-center bg-white/90">
                                <Text className="text-red-500">Failed to load PDF</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="flex-1 justify-center items-center bg-white rounded-lg mb-4">
                        <Text className="text-gray-600">PDF viewer not available</Text>
                        <Text className="text-gray-500 mt-2">Install react-native-view-pdf to view PDFs</Text>
                    </View>
                )
            ) : (
                <ScrollView className="flex-1 bg-white p-4 rounded-lg mb-4">
                    <Text className="text-gray-800" selectable>
                        {textContent || 'No content available'}
                    </Text>
                </ScrollView>
            )}

            {/* Text-to-Speech Button - Only show for text files */}
            {fileType === 'text/plain' && textContent && (
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
            )}
        </View>
    );
};

export default DocumentViewer;