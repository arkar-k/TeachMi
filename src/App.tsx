import { useState, useCallback } from "react"
import cardsData from "./data/cards.json"
import type { Card } from "./types"
import { useProgress } from "./hooks/useProgress"
import { HomePage } from "./pages/HomePage"
import { PastWordsPage } from "./pages/PastWordsPage"

const allCards: Card[] = cardsData

type Page = "home" | "past-words"

function App() {
  const [page, setPage] = useState<Page>("home")
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardKey, setCardKey] = useState(0)

  const {
    reviewedCards,
    getNextCard,
    rateCard,
    toggleRating,
    resetProgress,
    isComplete,
  } = useProgress(allCards)

  const loadNextCard = useCallback(() => {
    const next = getNextCard()
    setCurrentCard(next)
    setIsFlipped(false)
    setCardKey((k) => k + 1)
  }, [getNextCard])

  if (page === "past-words") {
    return (
      <PastWordsPage
        reviewedCards={reviewedCards}
        allCards={allCards}
        toggleRating={toggleRating}
        onClose={() => setPage("home")}
      />
    )
  }

  return (
    <HomePage
      currentCard={currentCard}
      isFlipped={isFlipped}
      cardKey={cardKey}
      setIsFlipped={setIsFlipped}
      loadNextCard={loadNextCard}
      rateCard={rateCard}
      resetProgress={resetProgress}
      isComplete={isComplete}
      onOpenPastWords={() => setPage("past-words")}
    />
  )
}

export default App
