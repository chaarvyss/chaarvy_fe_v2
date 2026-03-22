// Utility functions for the template designer
import { PlacedField } from './types'

export function saveToHistory(
  history: PlacedField[][],
  setHistory: (h: PlacedField[][]) => void,
  placed: PlacedField[],
  setHistoryIndex: (i: number) => void
) {
  const newHistory = [...history.slice(0, history.length), placed]
  setHistory(newHistory)
  setHistoryIndex(newHistory.length - 1)
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
