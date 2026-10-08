export type BookStatus = 'current' | 'past'

export interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string
  status: BookStatus
  addedAt: number
  finishedAt?: number
}

export interface Meaning {
  partOfSpeech: string
  definitions: string[]
}

export interface SavedWord {
  id: string
  bookId: string
  word: string
  phonetic?: string
  audioUrl?: string
  meanings: Meaning[]
  page?: string
  bookSentence?: string
  everydayExample?: string
  savedAt: number
  quizRight: number
  quizWrong: number
}

export interface AppData {
  version: 1
  books: Book[]
  words: SavedWord[]
}

/** What the dictionary returns for one word, before it is saved to a book. */
export interface Definition {
  word: string
  phonetic?: string
  audioUrl?: string
  meanings: Meaning[]
  example?: string
}

/** One result from the book search. */
export interface BookResult {
  title: string
  author: string
  coverUrl?: string
}
