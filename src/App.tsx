import { useState, useCallback } from "react"
import type { Card } from "./types"
import { DECKS } from "./data/decks"
import { useProgress } from "./hooks/useProgress"
import { HomePage } from "./pages/HomePage"
import { PastWordsPage } from "./pages/PastWordsPage"
import { AllCardsPage } from "./pages/AllCardsPage"
import { DeckMenu } from "./components/DeckMenu"

type Page = "home" | "past-words" | "all-cards"

function App() {
  const [selectedDeckId, setSelectedDeckId] = useState(DECKS[0].id)
  const [page, setPage] = useState<Page>("home")
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardKey, setCardKey] = useState(0)

  const selectedDeck = DECKS.find((d) => d.id === selectedDeckId) ?? DECKS[0]
  const allCards: Card[] = selectedDeck.cards

  const {
    reviewedCards,
    getNextCard,
    rateCard,
    toggleRating,
    resetProgress,
    isComplete,
  } = useProgress(allCards, selectedDeckId)

  const loadNextCard = useCallback(() => {
    const next = getNextCard()
    setCurrentCard(next)
    setIsFlipped(false)
    setCardKey((k) => k + 1)
  }, [getNextCard])

  const handleSelectDeck = (id: string) => {
    setSelectedDeckId(id)
    setCurrentCard(null)
    setIsFlipped(false)
    setCardKey((k) => k + 1)
    setPage("home")
  }

  if (page === "past-words") {
    return (
      <>
        <PastWordsPage
          reviewedCards={reviewedCards}
          allCards={allCards}
          toggleRating={toggleRating}
          onClose={() => setPage("home")}
        />
        <DeckMenu
          decks={DECKS}
          selectedDeckId={selectedDeckId}
          onSelectDeck={handleSelectDeck}
        />
      </>
    )
  }

  if (page === "all-cards") {
    return (
      <>
        <AllCardsPage
          allCards={allCards}
          onClose={() => setPage("home")}
        />
        <DeckMenu
          decks={DECKS}
          selectedDeckId={selectedDeckId}
          onSelectDeck={handleSelectDeck}
        />
      </>
    )
  }

  return (
    <>
      <HomePage
        currentCard={currentCard}
        isFlipped={isFlipped}
        cardKey={cardKey}
        setIsFlipped={setIsFlipped}
        loadNextCard={loadNextCard}
        rateCard={rateCard}
        resetProgress={resetProgress}
        isComplete={isComplete}
        deckName={selectedDeck.name}
        onOpenPastWords={() => setPage("past-words")}
        onOpenAllCards={() => setPage("all-cards")}
      />
      <DeckMenu
        decks={DECKS}
        selectedDeckId={selectedDeckId}
        onSelectDeck={handleSelectDeck}
      />
    </>
  )
}

export default App
