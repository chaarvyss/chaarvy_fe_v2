import { useState, useCallback } from 'react'

export const useTemplateHistory = () => {
  const [placed, setPlaced] = useState<PlacedField[]>([])
  const [history, setHistory] = useState<PlacedField[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  const saveToHistory = useCallback(
    (newPlaced: PlacedField[]) => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(newPlaced)

        return newHistory
      })
      setHistoryIndex(prev => prev + 1)
    },
    [historyIndex]
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setPlaced(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setPlaced(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  const clearHistory = useCallback(() => {
    setPlaced([])
    setHistory([[]])
    setHistoryIndex(0)
  }, [])

  return { placed, setPlaced, historyIndex, historyLength: history.length, saveToHistory, undo, redo, clearHistory }
}
