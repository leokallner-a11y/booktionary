import { Cover, Header } from '../components/common'
import { firstDefinition, plural } from '../util'
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

  function remove() {
    if (confirm(`Delete “${book.title}” and its ${plural(words.length, 'saved word')}?`)) {
      store.deleteBook(book.id)
      navigate({ name: 'home', tab: book.status }, true)
    }
  }

  return (
    <>
      <Header title={book.title} back={back} />
      <main className="page">
        <div className="book-hero">
          <Cover book={book} size="md" />
          <div>
            <div className="book-title">{book.title}</div>
            <div className="muted">{book.author}</div>
            {book.status === 'past' && <div className="badge">Finished</div>}
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
