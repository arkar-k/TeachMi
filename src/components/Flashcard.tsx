import { useState } from "react"
import { motion } from "framer-motion"
import type { Card } from "../types"

interface FlashcardProps {
  card: Card
  onFlip?: () => void
}

export function Flashcard({ card, onFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true)
      onFlip?.()
    }
  }

  return (
    <div
      className="w-full max-w-sm mx-auto cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        {/* Front */}
        <div
          className="bg-white rounded-3xl shadow-lg p-8 min-h-[280px] flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-2xl text-center text-gray-800 leading-relaxed">
            {card.sentence}
          </p>
        </div>

        {/* Back */}
        <div
          className="bg-white rounded-3xl shadow-lg px-6 pb-6 pt-8 min-h-[280px] absolute inset-0 flex flex-col justify-center gap-4 overflow-y-auto"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className="text-xl text-center text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: card.sentence_furigana }}
          />
          <p className="text-base text-center text-gray-500">
            {card.sentence_en}
          </p>

          {/* Kanji breakdown */}
          <div className="border-t border-gray-100 pt-3">
            {/* Main target word */}
            <div className="text-center mb-3">
              <span
                className="text-2xl font-bold text-mint-500"
                dangerouslySetInnerHTML={{
                  __html: `<ruby>${card.word_kanji}<rt>${card.word_furigana}</rt></ruby>`,
                }}
              />
              <p className="text-sm text-gray-500 mt-1">{card.word_en}</p>
            </div>

            {/* Extra kanji */}
            {card.extra_kanji && card.extra_kanji.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {card.extra_kanji.map((k) => (
                  <span key={k.kanji} className="text-sm" style={{ color: "#5A7C8C" }}>
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
        </div>
      </motion.div>
    </div>
  )
}
