import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Card } from "../types"
import { Flashcard } from "../components/Flashcard"

interface HomePageProps {
  currentCard: Card | null
  isFlipped: boolean
  cardKey: number
  setIsFlipped: (flipped: boolean) => void
  loadNextCard: () => void
  rateCard: (cardId: string, rating: "thumbs_up" | "thumbs_down") => void
  resetProgress: () => void
  isComplete: boolean
  onOpenPastWords: () => void
}

export function HomePage({
  currentCard,
  isFlipped,
  cardKey,
  setIsFlipped,
  loadNextCard,
  rateCard,
  resetProgress,
  isComplete,
  onOpenPastWords,
}: HomePageProps) {
  useEffect(() => {
    if (!currentCard && !isComplete) {
      loadNextCard()
    }
  }, [currentCard, isComplete, loadNextCard])

  const handleRate = (rating: "thumbs_up" | "thumbs_down") => {
    if (!currentCard) return
    rateCard(currentCard.id, rating)
    loadNextCard()
  }

  if (isComplete) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-lg p-10 max-w-sm w-full"
        >
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Congratulations!
          </h2>
          <p className="text-gray-500 mb-6">
            You've learned all the N3 words! Amazing work!
          </p>
          <button
            onClick={resetProgress}
            className="bg-mint-400 hover:bg-mint-500 text-white font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Start over
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col items-center px-4 pt-6 pb-8">
      {/* Past words button */}
      <button
        onClick={onOpenPastWords}
        className="bg-mint-200 hover:bg-mint-300 text-mint-500 font-semibold text-sm py-2 px-5 rounded-full mb-8 transition-colors"
      >
        Past words
      </button>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center w-full max-w-sm">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={cardKey}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full"
              style={{ perspective: 1000 }}
            >
              <Flashcard
                card={currentCard}
                onFlipChange={setIsFlipped}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbs buttons */}
      <AnimatePresence>
        {isFlipped && currentCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex gap-8 mt-8"
          >
            <button
              onClick={() => handleRate("thumbs_down")}
              className="w-16 h-16 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-2xl transition-colors shadow-md"
              aria-label="I don't know this yet"
            >
              👎
            </button>
            <button
              onClick={() => handleRate("thumbs_up")}
              className="w-16 h-16 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-2xl transition-colors shadow-md"
              aria-label="I know this"
            >
              👍
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
