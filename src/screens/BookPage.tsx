import { Cover, Header } from '../components/common'
import type { ChangeEvent, CSSProperties } from 'react'
import { coverFromPhoto } from '../photo'
import { bookColor, firstDefinition, plural } from '../util'
import { WordLookup } from '../components/WordLookup'
import { href, navigate } from '../router'
import type { Store } from '../store'
import type { Book } from '../types'

export function BookPage({ store, book }: { store: Store; book: Book }) {
  const words = store.data.words.filter((w) => w.bookId === book.id)
  const back = href({ name: 'home', tab: book.status })

  function toggleFinished() {
    store.updateBook(book.id, book.status === 'current'
      ? { status: 'past', finishedAt: Date.now() }
      : { status: 'current', finishedAt: undefined })
  }

  async function onCoverPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      store.updateBook(book.id, { coverUrl: await coverFromPhoto(file) })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'That photo could not be used.')
    }
  }

  function remove() {
    if (confirm(`Delete “${book.title}” and its ${plural(words.length, 'saved word')}?`)) {
      store.deleteBook(book.id)
      navigate({ name: 'home', tab: book.status }, true)
    }
  }

  return (
    <>
      <Header title={book.title} back={back} />
      <main className="page" style={{ '--book': bookColor(book.title) } as CSSProperties}>
        <div className="book-hero">
          <Cover book={book} size="md" />
          <div>
            <div className="book-title">{book.title}</div>
            <div className="muted">{book.author}</div>
            {book.status === 'past' && <div className="badge">Finished</div>}
            <label className="photo-button">
              📷 {book.coverUrl?.startsWith('data:') ? 'Retake cover photo' : 'Use a photo of my copy'}
              <input type="file" accept="image/*" onChange={onCoverPhoto} />
            </label>
          </div>
        </div>

        <WordLookup store={store} bookId={book.id} />

        <section>
          <div className="section-head">
            <h2>New Vocab Words</h2>
            <span className="muted">{words.length}</span>
          </div>
          {words.length === 0 ? (
            <p className="muted">Words you save from this book will appear here.</p>
          ) : (
            <>
              <div className="row">
                <a className="button secondary" href={href({ name: 'review', bookId: book.id })}>
                  Review
                </a>
                {words.length >= 2 && (
                  <a className="button secondary" href={href({ name: 'quiz', bookId: book.id })}>
                    Quiz
                  </a>
                )}
              </div>
              <ul className="word-list">
                {words.map((w) => (
                  <li key={w.id}>
                    <a href={href({ name: 'word', bookId: book.id, wordId: w.id })}>
                      <span className="word">{w.word}</span>
                      {w.page && <span className="muted"> · p. {w.page}</span>}
                      <span className="def">{firstDefinition(w)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <div className="book-actions">
          <button className="button secondary" onClick={toggleFinished}>
            {book.status === 'current' ? 'I finished this book' : 'Move back to Current'}
          </button>
          <button className="link danger" onClick={remove}>
            Delete book
          </button>
        </div>
      </main>
    </>
  )
}
