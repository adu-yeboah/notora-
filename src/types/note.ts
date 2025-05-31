export interface FormattedText {
  text: string;
  formats: TextFormat[];
}



export interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  heading: "H1" | "H2" | "H3" | "";
  color: string;
}


export type NoteType = {
  formattedContent(formattedContent: any): FormattedText;
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
}


export type RecordType = {
  id: string;
  name: string;
  uri: string;
  duration: number;
  timestamp: string;
  waveform?: string; 
}


