import { useState, useCallback, useEffect, useRef } from "react"
import type { Card, UserProgress } from "../types"

const STORAGE_KEY = "teachmi_progress"
const MIN_COOLDOWN = 5
const MAX_COOLDOWN = 10

function loadProgress(): UserProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProgress(progress: UserProgress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function useProgress(allCards: Card[]) {
  const [progress, setProgress] = useState<UserProgress[]>(loadProgress)
  // Track recently shown card IDs for cooldown spacing
  const recentHistory = useRef<string[]>([])
  // Track cooldown per thumbs-down card (randomized between MIN and MAX)
  const cooldownMap = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

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
        // Check cooldown: card must not be in the last N recent cards
        const cooldown = cooldownMap.current.get(card.id) ??
          (MIN_COOLDOWN + Math.floor(Math.random() * (MAX_COOLDOWN - MIN_COOLDOWN + 1)))
        // Store the cooldown if not yet set
        if (!cooldownMap.current.has(card.id)) {
          cooldownMap.current.set(card.id, cooldown)
        }
        const recentSlice = recent.slice(-cooldown)
        if (!recentSlice.includes(card.id)) {
          thumbsDown.push(card)
        }
      }
    }

    // 70% chance to pick from eligible thumbs_down if available
    const pool =
      thumbsDown.length > 0 && (unseen.length === 0 || Math.random() < 0.7)
        ? thumbsDown
        : unseen

    if (pool.length === 0) return null
    const chosen = pool[Math.floor(Math.random() * pool.length)]

    // Record in history
    recentHistory.current.push(chosen.id)
    // Keep history bounded
    if (recentHistory.current.length > 50) {
      recentHistory.current = recentHistory.current.slice(-30)
    }

    // Re-randomize cooldown for this card after it's shown again
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
        return [
          ...filtered,
          { card_id: cardId, rating, reviewed_at: Date.now() },
        ]
      })
    },
    []
  )

  const toggleRating = useCallback((cardId: string) => {
    setProgress((prev) =>
      prev.map((p) =>
        p.card_id === cardId
          ? {
              ...p,
              rating:
                p.rating === "thumbs_up" ? "thumbs_down" : "thumbs_up",
              reviewed_at: Date.now(),
            }
          : p
      )
    )
  }, [])

  const resetProgress = useCallback(() => {
    setProgress([])
    localStorage.removeItem(STORAGE_KEY)
    recentHistory.current = []
    cooldownMap.current.clear()
  }, [])

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
