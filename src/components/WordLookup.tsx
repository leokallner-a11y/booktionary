import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { lookUpWord, NotFoundError, suggestWords } from '../api'
import { href } from '../router'
import type { Store } from '../store'
import type { Definition } from '../types'
import { Meanings } from './common'
import { playAudio } from '../util'

type Lookup =
  | { state: 'idle' }
  | { state: 'loading'; word: string }
  | { state: 'found'; def: Definition }
  | { state: 'notFound'; word: string }
  | { state: 'error'; word: string }

export function WordLookup({ store, bookId }: { store: Store; bookId: string }) {
  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [highlight, setHighlight] = useState(-1)
  const [lookup, setLookup] = useState<Lookup>({ state: 'idle' })
  const [justSaved, setJustSaved] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  // The word last looked up; no suggestions are needed for it.
  const searched = useRef('')

  // Fetch type-ahead suggestions shortly after the reader stops typing.
  useEffect(() => {
    const prefix = text.trim()
    if (prefix.length < 2 || prefix === searched.current) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      suggestWords(prefix, controller.signal)
        .then((words) => {
          setSuggestions(words)
          setHighlight(-1)
        })
        .catch(() => {})
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [text])

  async function search(word: string) {
    word = word.trim()
    if (!word) return
    searched.current = word
    setText(word)
    setSuggestions([])
    setJustSaved('')
    setLookup({ state: 'loading', word })
    inputRef.current?.blur()
    try {
      setLookup({ state: 'found', def: await lookUpWord(word) })
    } catch (err) {
      setLookup(err instanceof NotFoundError ? { state: 'notFound', word } : { state: 'error', word })
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    search(highlight >= 0 ? suggestions[highlight] : text)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1))
    } else if (e.key === 'Escape') {
      setSuggestions([])
    }
  }

  function reset() {
    setText('')
    setLookup({ state: 'idle' })
    inputRef.current?.focus()
  }

  function onSaved(word: string) {
    setJustSaved(word)
    setText('')
    setLookup({ state: 'idle' })
  }

  const existing = (word: string) =>
    store.data.words.find((w) => w.bookId === bookId && w.word.toLowerCase() === word.toLowerCase())

  return (
    <section className="lookup">
      <form className="lookup-form" onSubmit={onSubmit} role="search">
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Look up a word"
          aria-label="Look up a word"
          aria-autocomplete="list"
          aria-controls="suggestions"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setJustSaved('')
            if (e.target.value.trim().length < 2) setSuggestions([])
          }}
          onKeyDown={onKeyDown}
        />
        {suggestions.length > 0 && (
          <ul id="suggestions" className="suggestions" role="listbox">
            {suggestions.map((s, i) => (
              <li key={s} role="option" aria-selected={i === highlight}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => search(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {justSaved && <p className="toast">Saved “{justSaved}”</p>}

      {lookup.state === 'loading' && <p className="muted">Looking up “{lookup.word}”…</p>}

      {lookup.state === 'error' && (
        <div className="card">
          <p>Couldn't reach the dictionary. Check your connection and try again.</p>
          <button className="button" onClick={() => search(lookup.word)}>
            Try again
          </button>
        </div>
      )}

      {lookup.state === 'notFound' && (
        <SaveCard
          key={lookup.word}
          store={store}
          bookId={bookId}
          def={{ word: lookup.word, meanings: [] }}
          notFound
          existingId={existing(lookup.word)?.id}
          onSaved={onSaved}
          onCancel={reset}
        />
      )}

      {lookup.state === 'found' && (
        <SaveCard
          key={lookup.def.word}
          store={store}
          bookId={bookId}
          def={lookup.def}
          existingId={existing(lookup.def.word)?.id}
          onSaved={onSaved}
          onCancel={reset}
        />
      )}
    </section>
  )
}

function SaveCard(props: {
  store: Store
  bookId: string
  def: Definition
  notFound?: boolean
  existingId?: string
  onSaved: (word: string) => void
  onCancel: () => void
}) {
  const { store, bookId, def, notFound, existingId } = props
  const [page, setPage] = useState('')
  const [bookSentence, setBookSentence] = useState('')
  const [everydayExample, setEverydayExample] = useState(def.example ?? '')
  const [ownDefinition, setOwnDefinition] = useState('')

  function save(e: FormEvent) {
    e.preventDefault()
    const meanings = notFound
      ? ownDefinition.trim()
        ? [{ partOfSpeech: 'my note', definitions: [ownDefinition.trim()] }]
        : []
      : def.meanings
    store.saveWord({
      bookId,
      word: def.word,
      phonetic: def.phonetic,
      audioUrl: def.audioUrl,
      meanings,
      page: page.trim() || undefined,
      bookSentence: bookSentence.trim() || undefined,
      everydayExample: everydayExample.trim() || undefined,
    })
    props.onSaved(def.word)
  }

  return (
    <form className="card definition" onSubmit={save}>
      <div className="word-heading">
        <h2>{def.word}</h2>
        {def.phonetic && <span className="muted">{def.phonetic}</span>}
        {def.audioUrl && (
          <button type="button" className="icon-button" onClick={() => playAudio(def.audioUrl)} aria-label="Play pronunciation">
            🔊
          </button>
        )}
      </div>

      {notFound ? (
        <>
          <p className="muted">The dictionary doesn't have this word. You can still save it with your own note.</p>
          <label>
            What you think it means
            <textarea rows={2} value={ownDefinition} onChange={(e) => setOwnDefinition(e.target.value)} />
          </label>
        </>
      ) : (
        <Meanings meanings={def.meanings} />
      )}

      {existingId ? (
        <p className="notice">
          Already saved for this book. <a href={href({ name: 'word', bookId, wordId: existingId })}>Open it</a>
        </p>
      ) : (
        <>
          <div className="save-fields">
            <label className="page-field">
              Page
              <input inputMode="numeric" value={page} onChange={(e) => setPage(e.target.value)} />
            </label>
            <label>
              Sentence from the book
              <textarea
                rows={2}
                placeholder="Where you found it (optional)"
                value={bookSentence}
                onChange={(e) => setBookSentence(e.target.value)}
              />
            </label>
            <label>
              Everyday example
              <textarea
                rows={2}
                placeholder="How you'd use it in daily life (optional)"
                value={everydayExample}
                onChange={(e) => setEverydayExample(e.target.value)}
              />
            </label>
          </div>
          <div className="row">
            <button className="button">Save word</button>
            <button type="button" className="button secondary" onClick={props.onCancel}>
              Cancel
            </button>
          </div>
        </>
      )}
    </form>
  )
}
