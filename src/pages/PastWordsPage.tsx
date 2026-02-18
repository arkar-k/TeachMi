import { motion } from "framer-motion"
import type { Card, UserProgress } from "../types"

interface PastWordsPageProps {
  reviewedCards: UserProgress[]
  allCards: Card[]
  toggleRating: (cardId: string) => void
  onClose: () => void
}

export function PastWordsPage({
  reviewedCards,
  allCards,
  toggleRating,
  onClose,
}: PastWordsPageProps) {
  const cardMap = new Map(allCards.map((c) => [c.id, c]))

  return (
    <div className="min-h-full flex flex-col px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Past words</h1>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* List */}
      {reviewedCards.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          No words reviewed yet
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviewedCards.map((p) => {
            const card = cardMap.get(p.card_id)
            if (!card) return null

            return (
              <motion.div
                key={p.card_id}
                layout
                className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-base text-gray-800 leading-relaxed mb-1"
                    dangerouslySetInnerHTML={{
                      __html: card.sentence_furigana,
                    }}
                  />
                  {/* Main word */}
                  <div className="flex items-baseline gap-2 text-sm mb-1">
                    <span
                      className="font-semibold text-mint-500"
                      dangerouslySetInnerHTML={{
                        __html: `<ruby>${card.word_kanji}<rt>${card.word_furigana}</rt></ruby>`,
                      }}
                    />
                    <span className="text-gray-400">{card.word_en}</span>
                  </div>
                  {/* Extra kanji */}
                  {card.extra_kanji && card.extra_kanji.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: "#5A7C8C" }}>
                      {card.extra_kanji.map((k) => (
                        <span key={k.kanji}>
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
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  onClick={() => toggleRating(p.card_id)}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  aria-label={
                    p.rating === "thumbs_up"
                      ? "Mark as not learned"
                      : "Mark as learned"
                  }
                >
                  {p.rating === "thumbs_up" ? "👍" : "👎"}
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
