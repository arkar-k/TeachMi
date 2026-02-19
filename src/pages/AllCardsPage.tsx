import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Card } from "../types"

interface AllCardsPageProps {
  allCards: Card[]
  onClose: () => void
}

const BATCH_SIZE = 20

function normalizeQuery(str: string): string {
  return str.toLowerCase().trim()
}

function cardMatchesQuery(card: Card, query: string): boolean {
  if (!query) return true
  const q = normalizeQuery(query)
  return (
    card.word_kanji.includes(q) ||
    card.word_furigana.includes(q) ||
    card.word_en.toLowerCase().includes(q) ||
    card.sentence.includes(q) ||
    card.sentence_en.toLowerCase().includes(q)
  )
}

interface CardRowProps {
  card: Card
  isExpanded: boolean
  onToggle: () => void
}

function CardRow({ card, isExpanded, onToggle }: CardRowProps) {
  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-4 flex items-start gap-3 focus:outline-none"
      >
        <div className="flex-1 min-w-0">
          <p className="text-base text-gray-800 leading-relaxed mb-1 text-left">
            {card.sentence}
          </p>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-mint-500">
              {card.word_kanji}
            </span>
            <span className="text-gray-400">{card.word_en}</span>
          </div>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-gray-300 text-sm mt-1 leading-none"
        >
          ▼
        </motion.span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 border-t border-gray-100 flex flex-col gap-3">
              {/* Sentence with furigana */}
              <div
                className="text-base text-gray-800 leading-relaxed text-center"
                dangerouslySetInnerHTML={{ __html: card.sentence_furigana }}
              />
              {/* English translation */}
              <p className="text-sm text-gray-500 text-center">
                {card.sentence_en}
              </p>
              {/* Main word */}
              <div className="border-t border-gray-100 pt-3 text-center">
                <span
                  className="text-xl font-bold text-mint-500"
                  dangerouslySetInnerHTML={{
                    __html: `<ruby>${card.word_kanji}<rt>${card.word_furigana}</rt></ruby>`,
                  }}
                />
                <p className="text-sm text-gray-500 mt-0.5">{card.word_en}</p>
              </div>
              {/* Extra kanji */}
              {card.extra_kanji && card.extra_kanji.length > 0 && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                  {card.extra_kanji.map((k) => (
                    <span
                      key={k.kanji}
                      className="text-sm"
                      style={{ color: "#5A7C8C" }}
                    >
                      <span
                        className="font-medium"
                        dangerouslySetInnerHTML={{
                          __html: `<ruby>${k.kanji}<rt>${k.furigana}</rt></ruby>`,
                        }}
                      />
                      <span className="opacity-70 ml-0.5">{k.en}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function AllCardsPage({ allCards, onClose }: AllCardsPageProps) {
  const [query, setQuery] = useState("")
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filteredCards = useMemo(
    () => allCards.filter((card) => cardMatchesQuery(card, query)),
    [allCards, query]
  )

  const visibleCards = filteredCards.slice(0, displayCount)
  const hasMore = displayCount < filteredCards.length

  // Reset display count when query changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE)
    setExpandedId(null)
  }, [query])

  // Guard prevents firing twice in the same render cycle (e.g. StrictMode double-invoke)
  const loadingRef = useRef(false)

  const loadMore = useCallback(() => {
    if (loadingRef.current) return
    loadingRef.current = true
    setDisplayCount((prev) => prev + BATCH_SIZE)
  }, [])

  // Reset the guard after each batch so the next one can fire
  useEffect(() => {
    loadingRef.current = false
  }, [displayCount])

  // Recreate the observer on every batch (displayCount dep). This means:
  // - if the sentinel is already on-screen after a batch lands, the new
  //   observer fires immediately and loads the next one automatically
  // - if the sentinel is below the fold, the observer waits for the user to scroll
  useEffect(() => {
    if (!hasMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [displayCount, hasMore, loadMore])

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-full flex flex-col px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">All Cards</h1>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search kanji, reading, or meaning…"
          className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white shadow-sm border border-gray-100 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-300"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-400 text-sm"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 mb-3 px-1">
        {filteredCards.length === allCards.length
          ? `${allCards.length} cards`
          : `${filteredCards.length} of ${allCards.length} cards`}
      </p>

      {/* List */}
      {filteredCards.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No cards match "{query}"
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleCards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              isExpanded={expandedId === card.id}
              onToggle={() => handleToggle(card.id)}
            />
          ))}

          {/* Sentinel for infinite scroll */}
          {hasMore && (
            <div ref={sentinelRef} className="py-4 flex justify-center">
              <span className="text-xs text-gray-300">Loading more…</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
