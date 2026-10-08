import { useCallback, useEffect, useState } from 'react'
import type { AppData, Book, SavedWord } from './types'

// Version 1 is single-user, so everything lives in this browser's storage.
// The Backup screen exports and restores it as a JSON file.
const STORAGE_KEY = 'booktionary:data'

const EMPTY: AppData = { version: 1, books: [], words: [] }

export function newId(): string {
  return crypto.randomUUID()
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    return parseBackup(raw)
  } catch {
    return EMPTY
  }
}

export function parseBackup(raw: string): AppData {
  const data = JSON.parse(raw) as Partial<AppData>
  if (!Array.isArray(data.books) || !Array.isArray(data.words)) {
    throw new Error('That file is not a Booktionary backup.')
  }
  return { version: 1, books: data.books, words: data.words }
}

export function useStore() {
  const [data, setData] = useState<AppData>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Ask the browser not to clear our storage when space runs low.
  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {})
  }, [])

  const addBook = useCallback((book: Omit<Book, 'id' | 'addedAt' | 'status'>) => {
    const created: Book = { ...book, id: newId(), addedAt: Date.now(), status: 'current' }
    setData((d) => ({ ...d, books: [created, ...d.books] }))
    return created
  }, [])

  const updateBook = useCallback((id: string, patch: Partial<Book>) => {
    setData((d) => ({ ...d, books: d.books.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
  }, [])

  const deleteBook = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      books: d.books.filter((b) => b.id !== id),
      words: d.words.filter((w) => w.bookId !== id),
    }))
  }, [])

  const saveWord = useCallback((word: Omit<SavedWord, 'id' | 'savedAt' | 'quizRight' | 'quizWrong'>) => {
    const created: SavedWord = { ...word, id: newId(), savedAt: Date.now(), quizRight: 0, quizWrong: 0 }
    setData((d) => ({ ...d, words: [created, ...d.words] }))
    return created
  }, [])

  const updateWord = useCallback((id: string, patch: Partial<SavedWord>) => {
    setData((d) => ({ ...d, words: d.words.map((w) => (w.id === id ? { ...w, ...patch } : w)) }))
  }, [])

  const deleteWord = useCallback((id: string) => {
    setData((d) => ({ ...d, words: d.words.filter((w) => w.id !== id) }))
  }, [])

  const recordQuizAnswer = useCallback((id: string, correct: boolean) => {
    setData((d) => ({
      ...d,
      words: d.words.map((w) =>
        w.id !== id ? w : correct ? { ...w, quizRight: w.quizRight + 1 } : { ...w, quizWrong: w.quizWrong + 1 },
      ),
    }))
  }, [])

  const replaceAll = useCallback((next: AppData) => setData(next), [])

  return { data, addBook, updateBook, deleteBook, saveWord, updateWord, deleteWord, recordQuizAnswer, replaceAll }
}

export type Store = ReturnType<typeof useStore>
