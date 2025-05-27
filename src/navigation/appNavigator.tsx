import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";
// import NoteEditor from "../screens/NoteEditor";
import NoteViewer from "../screens/NoteViewer";
import Recorder from "../screens/Recorder";
import SlideImporter from "../screens/SlideImporter";
import Settings from "../screens/Settings";
import NoteEditor from "../screens/NoteEditor";
import Add from "../screens/Add";
// import { NoteEditor } from "../screens/NoteEditor";


export default function AppNavigator() {
    const Stack = createNativeStackNavigator()
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="Home"
        >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="NoteEditor" component={NoteEditor} />
            <Stack.Screen name="NoteViewer" component={NoteViewer} />
            <Stack.Screen name="Recorder" component={Recorder} />
            <Stack.Screen name="SlideImporter" component={SlideImporter} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Add" component={Add} />


        </Stack.Navigator>
    )
}
