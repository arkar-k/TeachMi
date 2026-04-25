import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Deck } from "../data/decks"

interface DeckMenuProps {
  decks: Deck[]
  selectedDeckId: string
  onSelectDeck: (id: string) => void
}

export function DeckMenu({ decks, selectedDeckId, onSelectDeck }: DeckMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Open deck menu"
      >
        <div className="flex flex-col gap-1">
          <span className="block w-4 h-0.5 bg-gray-600 rounded-full" />
          <span className="block w-4 h-0.5 bg-gray-600 rounded-full" />
          <span className="block w-4 h-0.5 bg-gray-600 rounded-full" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg overflow-hidden origin-top-right"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">
              Decks
            </p>
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  onSelectDeck(deck.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                  deck.id === selectedDeckId
                    ? "bg-mint-50 text-mint-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{deck.name}</span>
                {deck.id === selectedDeckId && (
                  <span className="text-mint-500 text-base leading-none">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
