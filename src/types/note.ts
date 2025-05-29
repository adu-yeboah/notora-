export type NoteType = {
  formattedContent(formattedContent: any): FormattedText;
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
}