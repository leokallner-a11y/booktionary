import type { SavedWord } from './types'

export function firstDefinition(word: Pick<SavedWord, 'meanings'>): string {
  return word.meanings[0]?.definitions[0] ?? ''
}

export function plural(n: number, one: string, many = one + 's') {
  return `${n} ${n === 1 ? one : many}`
}

export function playAudio(url?: string) {
  if (url) new Audio(url).play().catch(() => {})
}

// Each book gets its own color, picked from its title so it never changes.
const BOOK_COLORS = ['#5b4fe0', '#e0607e', '#13a3a0', '#f08c2e', '#3a86e8', '#9b51d6', '#2fa864', '#d9543b']

export function bookColor(title: string): string {
  let hash = 0
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return BOOK_COLORS[Math.abs(hash) % BOOK_COLORS.length]
}

const POS_CLASSES: Record<string, string> = { noun: 'pos-noun', verb: 'pos-verb', adjective: 'pos-adj', adverb: 'pos-adv' }

export function posClass(partOfSpeech: string): string {
  return POS_CLASSES[partOfSpeech] ?? 'pos-other'
}
