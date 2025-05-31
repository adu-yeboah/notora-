import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';

export default function Heading() {
    const navigation = useNavigation();
    const handleBack = () => {
        navigation.goBack();
    };
    return (
        <View className="flex flex-row gap-2 items-center">
            <TouchableOpacity onPress={handleBack}>
                <MaterialCommunityIcons name="keyboard-backspace" size={40} color="grey" />
            </TouchableOpacity>

            <Image
                source={require("../../../assets/logo.png")}
                resizeMode="contain"
                className="h-8 w-32"
            />
        </View>

    )
}