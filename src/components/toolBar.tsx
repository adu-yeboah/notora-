import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToolbarProps {
    onFormat?: (type: string) => void;
    onCamera?: () => void;
    onRecord?: () => void;
    onTTS?: () => void;
    onTag?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onFormat, onCamera, onRecord, onTTS, onTag }) => {
    return (
        <View className={`border border-border flex-row justify-around p-2 rounded-lg my-4`}>
            <TouchableOpacity onPress={() => onFormat('bold')}>
                <Ionicons name="text" size={24} color={"grey"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCamera}>
                <Ionicons name="camera" size={24} color={"grey"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRecord}>
                <Ionicons name="mic" size={24} color={"grey"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onTTS}>
                <Ionicons name="volume-high" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onTag}>
                <Ionicons name="pricetag" size={24} color={"grey"} />
            </TouchableOpacity>
        </View>
    );
};

export default Toolbar;