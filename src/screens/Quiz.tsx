import { useState } from 'react'
import { Header } from '../components/common'
import { firstDefinition } from '../util'
import { href } from '../router'
import type { Store } from '../store'
import type { SavedWord } from '../types'

const QUESTIONS_PER_ROUND = 10
const CHOICES = 4

interface Question {
  word: SavedWord
  choices: string[]
  answer: string
}

function pickRandom<T>(items: T[], n: number): T[] {
  const pool = [...items]
  const out: T[] = []
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  return out
}

/** Words missed more often (and never-quizzed words) come up more. */
function weight(w: SavedWord) {
  return 1 + w.quizWrong * 2 + (w.quizRight + w.quizWrong === 0 ? 1 : 0) - Math.min(w.quizRight, 3) * 0.25
}

function buildRound(quizWords: SavedWord[], allWords: SavedWord[]): Question[] {
  const pool = [...quizWords]
  const picked: SavedWord[] = []
  while (picked.length < QUESTIONS_PER_ROUND && pool.length) {
    const total = pool.reduce((s, w) => s + weight(w), 0)
    let r = Math.random() * total
    const i = pool.findIndex((w) => (r -= weight(w)) <= 0)
    picked.push(pool.splice(i === -1 ? pool.length - 1 : i, 1)[0])
  }

  return picked.map((word) => {
    const answer = firstDefinition(word)
    // Wrong answers come from any saved word, so a small book still gets options.
    const others = [...new Set(allWords.filter((w) => w.id !== word.id).map(firstDefinition))].filter(
      (d) => d && d !== answer,
    )
    const choices = pickRandom([answer, ...pickRandom(others, CHOICES - 1)], CHOICES)
    return { word, choices, answer }
  })
}

export function Quiz({ store, bookId }: { store: Store; bookId: string }) {
  const allWords = store.data.words.filter((w) => firstDefinition(w))
  const book = store.data.books.find((b) => b.id === bookId)
  const quizWords = bookId === 'all' ? allWords : allWords.filter((w) => w.bookId === bookId)
  const back = book ? href({ name: 'book', bookId }) : href({ name: 'home', tab: 'current' })

  const [round, setRound] = useState(() => buildRound(quizWords, allWords))
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  if (quizWords.length < 2 || allWords.length < 2) {
    return (
      <>
        <Header title="Quiz" back={back} />
        <main className="page">
          <p className="muted">Save at least two words with definitions to start a quiz.</p>
        </main>
      </>
    )
  }

  const done = index >= round.length
  const q = round[index]

  function choose(choice: string) {
    if (chosen) return
    setChosen(choice)
    const correct = choice === q.answer
    if (correct) setScore((s) => s + 1)
    store.recordQuizAnswer(q.word.id, correct)
  }

  function next() {
    setChosen(null)
    setIndex((i) => i + 1)
  }

  function restart() {
    setRound(buildRound(quizWords, allWords))
    setIndex(0)
    setChosen(null)
    setScore(0)
  }

  return (
    <>
      <Header title={book ? `Quiz: ${book.title}` : 'Quiz: all books'} back={back} />
      <main className="page">
        {done ? (
          <div className="card center score-card">
            <div className="score-emoji">{score === round.length ? '🏆' : score >= round.length / 2 ? '🎉' : '📚'}</div>
            <h2>
              {score} of {round.length} right
            </h2>
            <p className="muted">
              {score === round.length ? 'Perfect round.' : 'Words you missed will come up more often next time.'}
            </p>
            <div className="row center">
              <button className="button" onClick={restart}>
                Play again
              </button>
              <a className="button secondary" href={back}>
                Done
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="progress" aria-label={`Question ${index + 1} of ${round.length}`}>
              <div style={{ width: `${(index / round.length) * 100}%` }} />
            </div>
            <p className="muted center">
              Question {index + 1} of {round.length} · {score} right so far
            </p>
            <h2 className="quiz-word">{q.word.word}</h2>
            <p className="muted center">What does it mean?</p>
            <ul className="choices">
              {q.choices.map((c) => {
                const state = !chosen ? '' : c === q.answer ? 'right' : c === chosen ? 'wrong' : 'faded'
                return (
                  <li key={c}>
                    <button className={`choice ${state}`} onClick={() => choose(c)} disabled={!!chosen}>
                      {c}
                    </button>
                  </li>
                )
              })}
            </ul>
            {chosen && (
              <div className="stack">
                {q.word.bookSentence && <p className="quote">“{q.word.bookSentence}”</p>}
                <button className="button wide" onClick={next}>
                  {index + 1 === round.length ? 'See score' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
