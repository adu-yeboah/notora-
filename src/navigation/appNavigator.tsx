import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";
import NoteViewer from "../screens/NoteViewer";
import Recorder from "../screens/Recorder";
import Settings from "../screens/Settings";
import NoteEditor from "../screens/NoteEditor";
import Add from "../screens/Add";
import DocumentViewer from "../screens/DocumentViewer";
import AudioPlayer from "../screens/AudioPlayer";
import { RootStackParamList } from "../types/navigation";

export default function AppNavigator() {
    const Stack = createNativeStackNavigator<RootStackParamList>();
    
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="Home"
        >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="NoteEditor" component={NoteEditor} />
            <Stack.Screen name="DocumentViewer" component={DocumentViewer} />
            <Stack.Screen name="NoteViewer" component={NoteViewer} />
            <Stack.Screen name="Recorder" component={Recorder} />
            <Stack.Screen name="AudioPlayer" component={AudioPlayer} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Add" component={Add} />
        </Stack.Navigator>
    )
}