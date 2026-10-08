import type { BookResult, Definition, Meaning } from './types'

// All three services are free and need no API key.
const DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/'
const SUGGEST_URL = 'https://api.datamuse.com/sug'
const BOOK_SEARCH_URL = 'https://openlibrary.org/search.json'

export class NotFoundError extends Error {}

interface DictionaryEntry {
  word: string
  phonetic?: string
  phonetics?: { text?: string; audio?: string }[]
  meanings?: {
    partOfSpeech: string
    definitions: { definition: string; example?: string }[]
  }[]
}

export async function lookUpWord(word: string, signal?: AbortSignal): Promise<Definition> {
  const res = await fetch(DICTIONARY_URL + encodeURIComponent(word.trim().toLowerCase()), { signal })
  if (res.status === 404) throw new NotFoundError(word)
  if (!res.ok) throw new Error(`Dictionary request failed (${res.status})`)
  const entries = (await res.json()) as DictionaryEntry[]

  // The API can return several entries for one word (e.g. noun and verb senses
  // split apart), so merge their meanings by part of speech.
  const byPart = new Map<string, Meaning>()
  let example: string | undefined
  for (const entry of entries) {
    for (const m of entry.meanings ?? []) {
      const meaning = byPart.get(m.partOfSpeech) ?? { partOfSpeech: m.partOfSpeech, definitions: [] }
      for (const d of m.definitions) {
        if (meaning.definitions.length < 3) meaning.definitions.push(d.definition)
        if (!example && d.example) example = d.example
      }
      byPart.set(m.partOfSpeech, meaning)
    }
  }

  const phonetics = entries.flatMap((e) => e.phonetics ?? [])
  return {
    word: entries[0]?.word ?? word,
    phonetic: entries.find((e) => e.phonetic)?.phonetic ?? phonetics.find((p) => p.text)?.text,
    audioUrl: phonetics.find((p) => p.audio)?.audio || undefined,
    meanings: [...byPart.values()],
    example,
  }
}

export async function suggestWords(prefix: string, signal?: AbortSignal): Promise<string[]> {
  const res = await fetch(`${SUGGEST_URL}?s=${encodeURIComponent(prefix)}&max=8`, { signal })
  if (!res.ok) return []
  const results = (await res.json()) as { word: string }[]
  // Datamuse sometimes suggests phrases; only single words can be looked up.
  return results.map((r) => r.word).filter((w) => !w.includes(' '))
}

export async function searchBooks(query: string, signal?: AbortSignal): Promise<BookResult[]> {
  const params = new URLSearchParams({ q: query, limit: '12', fields: 'title,author_name,cover_i' })
  const res = await fetch(`${BOOK_SEARCH_URL}?${params}`, { signal })
  if (!res.ok) throw new Error(`Book search failed (${res.status})`)
  const data = (await res.json()) as {
    docs: { title: string; author_name?: string[]; cover_i?: number }[]
  }
  return data.docs.map((d) => ({
    title: d.title,
    author: d.author_name?.slice(0, 2).join(', ') ?? 'Unknown author',
    coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : undefined,
  }))
}
