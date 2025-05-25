import AsyncStorage from '@react-native-async-storage/async-storage';
import { NoteType } from '../types/note';



export const saveNote = async (note: NoteType): Promise<void> => {
  try {
    const notes = await getNotes();
    const updatedNotes = [...notes, note];
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  } catch (e) {
    console.error('Error saving note:', e);
  }
};

export const getNotes = async (): Promise<NoteType[]> => {
  try {
    const notes = await AsyncStorage.getItem('notes');
    return notes ? JSON.parse(notes) : [];
  } catch (e) {
    console.error('Error retrieving notes:', e);
    return [];
  }
};

export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const notes = await getNotes();
    const updatedNotes = notes.filter(note => note.id !== noteId);
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  } catch (e) {
    console.error('Error deleting note:', e);
  }
};