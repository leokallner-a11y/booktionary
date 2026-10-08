import { Header, Meanings } from '../components/common'
import { playAudio } from '../util'
import { href, navigate } from '../router'
import type { Store } from '../store'
import type { Book, SavedWord } from '../types'

export function WordPage({ store, book, word }: { store: Store; book: Book; word: SavedWord }) {
  const back = href({ name: 'book', bookId: book.id })

  function remove() {
    if (confirm(`Remove “${word.word}” from ${book.title}?`)) {
      store.deleteWord(word.id)
      navigate({ name: 'book', bookId: book.id }, true)
    }
  }

  // Edits save as you type; there is no separate save button.
  const field = (key: 'page' | 'bookSentence' | 'everydayExample') => ({
    value: word[key] ?? '',
    onChange: (e: { target: { value: string } }) => store.updateWord(word.id, { [key]: e.target.value || undefined }),
  })

  const quizzed = word.quizRight + word.quizWrong

  return (
    <>
      <Header title={word.word} back={back} />
      <main className="page">
        <div className="card definition">
          <div className="word-heading">
            <h2>{word.word}</h2>
            {word.phonetic && <span className="muted">{word.phonetic}</span>}
            {word.audioUrl && (
              <button className="icon-button" onClick={() => playAudio(word.audioUrl)} aria-label="Play pronunciation">
                🔊
              </button>
            )}
          </div>
          {word.meanings.length ? <Meanings meanings={word.meanings} /> : <p className="muted">No definition saved.</p>}
        </div>

        <div className="stack">
          <label className="page-field">
            Page
            <input inputMode="numeric" {...field('page')} />
          </label>
          <label>
            Sentence from the book
            <textarea rows={3} {...field('bookSentence')} />
          </label>
          <label>
            Everyday example
            <textarea rows={3} {...field('everydayExample')} />
          </label>
        </div>

        <p className="muted small">
          Saved {new Date(word.savedAt).toLocaleDateString()} from {book.title}
          {quizzed > 0 && ` · Quiz: ${word.quizRight} of ${quizzed} right`}
        </p>

        <button className="link danger" onClick={remove}>
          Remove word
        </button>
      </main>
    </>
  )
}
