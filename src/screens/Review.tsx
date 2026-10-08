import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Header, Meanings } from '../components/common'
import { bookColor } from '../util'
import { href } from '../router'
import type { Book, SavedWord } from '../types'

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Review({ book, words }: { book: Book; words: SavedWord[] }) {
  const [deck, setDeck] = useState(words)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = deck[index]

  function go(delta: number) {
    setIndex((i) => (i + delta + deck.length) % deck.length)
    setFlipped(false)
  }

  return (
    <>
      <Header title="Review" back={href({ name: 'book', bookId: book.id })} />
      <main className="page" style={{ '--book': bookColor(book.title) } as CSSProperties}>
        {!card ? (
          <p className="muted">No words saved for this book yet.</p>
        ) : (
          <>
            <p className="muted center">
              {index + 1} of {deck.length} · tap the card to flip
            </p>
            <button className={`flashcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
              {!flipped ? (
                <span className="flash-word">{card.word}</span>
              ) : (
                <span className="flash-back">
                  <Meanings meanings={card.meanings} />
                  {card.bookSentence && <span className="quote">“{card.bookSentence}”{card.page && ` (p. ${card.page})`}</span>}
                  {card.everydayExample && <span className="example">{card.everydayExample}</span>}
                </span>
              )}
            </button>
            <div className="row center">
              <button className="button secondary" onClick={() => go(-1)}>
                Previous
              </button>
              <button className="button" onClick={() => go(1)}>
                Next
              </button>
            </div>
            <button
              className="link"
              onClick={() => {
                setDeck(shuffle(deck))
                setIndex(0)
                setFlipped(false)
              }}
            >
              Shuffle
            </button>
          </>
        )}
      </main>
    </>
  )
}
