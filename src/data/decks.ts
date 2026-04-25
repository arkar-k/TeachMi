import type { Card } from "../types"
import n2CardsData from "./cards.json"
import secondDeckData from "./second-deck.json"

export interface Deck {
  id: string
  name: string
  cards: Card[]
}

export const DECKS: Deck[] = [
  { id: "n2", name: "N3 words", cards: n2CardsData as Card[] },
  { id: "second", name: "Pregnancy", cards: secondDeckData as Card[] },
]
