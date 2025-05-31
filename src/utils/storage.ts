import AsyncStorage from '@react-native-async-storage/async-storage';
import { NoteType, RecordType } from '../types/note';



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


export const saveRecord = async (record: RecordType): Promise<void> => {
  try {
    const records = await getRecords();
    const updatesRecords = [...records, record]
    await AsyncStorage.setItem("records", JSON.stringify(updatesRecords))
  } catch (error) {
    console.log(error);
  }
}

export const getRecords = async (): Promise<RecordType[]> => {
  try {
    const records = await AsyncStorage.getItem("records");
    return records ? JSON.parse(records) : []
  } catch (error) {
    console.log(error);
    return []
  }
}

export const deleteRecord = async (recordId: string): Promise<void> => {
  try {
    const records = await getRecords();
    const updatedRecords = records.filter(record => record.id !== recordId);
    await AsyncStorage.setItem('records', JSON.stringify(updatedRecords));
  } catch (e) {
    console.error('Error deleting record:', e);
  }
};

export const renameRecord = async (recordId: string): Promise<void> => {
  try {
    const records = await getRecords();
    const updatedRecords = records.filter(record => record.id == recordId);
  } catch (error) {

  }
}