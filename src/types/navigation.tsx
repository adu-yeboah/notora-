// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  NoteEditor: { 
    note?: {
      id: string;
      title: string;
      content: string;
      createdAt?: string;
      updatedAt?: string;
    } | null;
  };
  DocumentViewer: {
    fileUri: string;
    fileName: string;
    fileType: string;
  };
  NoteViewer: {
    note: {
      id: string;
      title: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  Recorder: undefined;
  AudioPlayer: {
    audioUri: string;
    title?: string;
  };
  SlideImporter: undefined;
  Settings: undefined;
  Add: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}