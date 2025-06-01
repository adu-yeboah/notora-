import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

interface RecordCardProps  {
    item: {
        id: string | number;
        name: string;
        timestamp: number | string;
        duration: number;
    };
    playRecording: (item: RecordCardProps['item']) => void;
    deleteRecording: (id: RecordCardProps['item']['id']) => void;
    format: (duration: number) => string;
};

export default function RecordCard({ item, playRecording, deleteRecording, format }: RecordCardProps) {
    return (
        <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="font-medium text-gray-800 flex-1 mr-2" numberOfLines={1}>
                    {item.name}
                </Text>
                <Text className="text-gray-500 text-sm">{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">{format(item.duration)}</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        className="bg-green-500 px-4 py-2 rounded-lg"
                        onPress={() => playRecording(item)}
                    >
                        <Ionicons name="play" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-red-500 px-4 py-2 rounded-lg"
                        onPress={() => deleteRecording(item.id)}
                    >
                        <Ionicons name="trash-outline" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}