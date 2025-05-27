import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Add() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-background p-4">
            {/* Header with Logo and Settings */}
            <View className="flex-row justify-between items-center mb-6">
                <Image
                    source={require("../../assets/logo.png")}
                    resizeMode="contain"
                    className="h-8 w-32"
                />
                <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
                    <Ionicons name="settings" size={24} color="#4b5563" />
                </TouchableOpacity>
            </View>


            {/* Grid of Options */}
            <View className="flex-row flex-wrap justify-between p-2">
                {/* Record Button */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Recorder' as never)}
                    className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-lg items-center border border-gray-200 hover:border-blue-300"
                >
                    <FontAwesome name="microphone" size={32} color="#3b82f6" />
                    <Text className="mt-3 text-lg font-semibold text-gray-800">Record</Text>
                </TouchableOpacity>

                {/* Add Note Button */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('NoteEditor', { note: null })}
                    className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-lg items-center border border-gray-200 hover:border-blue-300"
                >
                    <MaterialIcons name="note-add" size={32} color="#3b82f6" />
                    <Text className="mt-3 text-lg font-semibold text-gray-800">Add Note</Text>
                </TouchableOpacity>

                {/* Import File Button */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Recorder' as never)}
                    className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-lg items-center border border-gray-200 hover:border-blue-300"
                >
                    <FontAwesome5 name="file-import" size={32} color="#3b82f6" />
                    <Text className="mt-3 text-lg font-semibold text-gray-800">Import File</Text>
                </TouchableOpacity>

                {/* Duplicate Record Button (can be replaced with another feature) */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Recorder' as never)}
                    className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-lg items-center border border-gray-200 hover:border-blue-300"
                >
                    <FontAwesome name="microphone" size={32} color="#3b82f6" />
                    <Text className="mt-3 text-lg font-semibold text-gray-800">Record</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}