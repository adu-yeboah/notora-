export type NoteType = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  audioUri?: string;
  slideUri?: string;
  timestamp: string;
}