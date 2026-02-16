
export interface VocabularyWord {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: string;
}

export interface AppState {
  currentIndex: number;
  isSpeaking: boolean;
}
