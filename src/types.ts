export interface KanjiWord {
  kanji: string
  furigana: string
  en: string
}

export interface Card {
  id: string
  sentence: string
  sentence_furigana: string
  sentence_en: string
  word_kanji: string
  word_furigana: string
  word_en: string
  extra_kanji: KanjiWord[]
}

export interface UserProgress {
  card_id: string
  rating: "thumbs_up" | "thumbs_down"
  reviewed_at: number
}
