import type { ReactNode } from 'react'
import type { Book, SavedWord } from '../types'

export function Header({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  return (
    <header className="header">
      {back ? (
        <a className="header-back" href={back} aria-label="Back">
          ‹
        </a>
      ) : (
        <span className="header-back" />
      )}
      <h1 className="header-title">{title}</h1>
      <span className="header-action">{action}</span>
    </header>
  )
}

export function Cover({ book, size = 'md' }: { book: Pick<Book, 'title' | 'coverUrl'>; size?: 'sm' | 'md' | 'lg' }) {
  if (book.coverUrl) {
    return <img className={`cover cover-${size}`} src={book.coverUrl} alt="" loading="lazy" />
  }
  return (
    <div className={`cover cover-${size} cover-blank`} aria-hidden="true">
      {book.title.slice(0, 1).toUpperCase()}
    </div>
  )
}

export function Meanings({ meanings }: { meanings: SavedWord['meanings'] }) {
  return (
    <div className="meanings">
      {meanings.map((m) => (
        <div key={m.partOfSpeech} className="meaning">
          <div className="pos">{m.partOfSpeech}</div>
          <ol>
            {m.definitions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
