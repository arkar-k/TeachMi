import { useState, useCallback, useEffect, useRef } from "react"
import type { Card, UserProgress } from "../types"

const MIN_COOLDOWN = 5
const MAX_COOLDOWN = 10

function storageKey(deckId: string) {
  return `teachmi_progress_${deckId}`
}

function loadProgress(deckId: string): UserProgress[] {
  try {
    const raw = localStorage.getItem(storageKey(deckId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProgress(deckId: string, progress: UserProgress[]) {
  localStorage.setItem(storageKey(deckId), JSON.stringify(progress))
}

export function useProgress(allCards: Card[], deckId: string) {
  const [progress, setProgress] = useState<UserProgress[]>(() => loadProgress(deckId))
  const recentHistory = useRef<string[]>([])
  const cooldownMap = useRef<Map<string, number>>(new Map())

  // Reload progress when deck changes
  useEffect(() => {
    setProgress(loadProgress(deckId))
    recentHistory.current = []
    cooldownMap.current.clear()
  }, [deckId])

  const getProgressMap = useCallback(() => {
    const map = new Map<string, UserProgress>()
    for (const p of progress) {
      map.set(p.card_id, p)
    }
    return map
  }, [progress])

  const getNextCard = useCallback((): Card | null => {
    const map = getProgressMap()
    const recent = recentHistory.current

    const thumbsDown: Card[] = []
    const unseen: Card[] = []

    for (const card of allCards) {
      const p = map.get(card.id)
      if (!p) {
        unseen.push(card)
      } else if (p.rating === "thumbs_down") {
        const cooldown =
          cooldownMap.current.get(card.id) ??
          MIN_COOLDOWN + Math.floor(Math.random() * (MAX_COOLDOWN - MIN_COOLDOWN + 1))
        if (!cooldownMap.current.has(card.id)) {
          cooldownMap.current.set(card.id, cooldown)
        }
        const recentSlice = recent.slice(-cooldown)
        if (!recentSlice.includes(card.id)) {
          thumbsDown.push(card)
        }
      }
    }

    const pool =
      thumbsDown.length > 0 && (unseen.length === 0 || Math.random() < 0.7)
        ? thumbsDown
        : unseen

    if (pool.length === 0) return null
    const chosen = pool[Math.floor(Math.random() * pool.length)]

    recentHistory.current.push(chosen.id)
    if (recentHistory.current.length > 50) {
      recentHistory.current = recentHistory.current.slice(-30)
    }

    if (map.get(chosen.id)?.rating === "thumbs_down") {
      cooldownMap.current.set(
        chosen.id,
        MIN_COOLDOWN + Math.floor(Math.random() * (MAX_COOLDOWN - MIN_COOLDOWN + 1))
      )
    }

    return chosen
  }, [allCards, getProgressMap])

  const rateCard = useCallback(
    (cardId: string, rating: "thumbs_up" | "thumbs_down") => {
      setProgress((prev) => {
        const filtered = prev.filter((p) => p.card_id !== cardId)
        const next = [...filtered, { card_id: cardId, rating, reviewed_at: Date.now() }]
        saveProgress(deckId, next)
        return next
      })
    },
    [deckId]
  )

  const toggleRating = useCallback(
    (cardId: string) => {
      setProgress((prev) => {
        const next: UserProgress[] = prev.map((p) =>
          p.card_id === cardId
            ? {
                ...p,
                rating: (p.rating === "thumbs_up" ? "thumbs_down" : "thumbs_up") as UserProgress["rating"],
                reviewed_at: Date.now(),
              }
            : p
        )
        saveProgress(deckId, next)
        return next
      })
    },
    [deckId]
  )

  const resetProgress = useCallback(() => {
    setProgress([])
    localStorage.removeItem(storageKey(deckId))
    recentHistory.current = []
    cooldownMap.current.clear()
  }, [deckId])

  const isComplete =
    allCards.length > 0 &&
    allCards.every((card) => {
      const p = getProgressMap().get(card.id)
      return p?.rating === "thumbs_up"
    })

  const reviewedCards = progress
    .slice()
    .sort((a, b) => b.reviewed_at - a.reviewed_at)

  return {
    progress,
    reviewedCards,
    getNextCard,
    rateCard,
    toggleRating,
    resetProgress,
    isComplete,
    getProgressMap,
  }
}
