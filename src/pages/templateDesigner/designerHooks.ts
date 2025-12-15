// Custom hooks for template designer state and logic
import { useState, useRef } from 'react'
import { PlacedField } from './types'

export function useDesignerState() {
  const [placed, setPlaced] = useState<PlacedField[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [clipboard, setClipboard] = useState<PlacedField | null>(null)
  const [history, setHistory] = useState<PlacedField[][]>([])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [dragState, setDragState] = useState<any>({
    isDragging: false,
    itemId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })
  const [resizeState, setResizeState] = useState<any>({
    isResizing: false,
    itemId: null,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  })
  const [guides, setGuides] = useState<any[]>([])
  const [zoom, setZoom] = useState(100)
  const [templateName, setTemplateName] = useState('Untitled Template')
  const [clientId] = useState('default')
  const [canvasWidth, setCanvasWidth] = useState(794)
  const [canvasHeight, setCanvasHeight] = useState(1123)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return {
    placed,
    setPlaced,
    selectedItem,
    setSelectedItem,
    editingItem,
    setEditingItem,
    clipboard,
    setClipboard,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    dragState,
    setDragState,
    resizeState,
    setResizeState,
    guides,
    setGuides,
    zoom,
    setZoom,
    templateName,
    setTemplateName,
    clientId,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    hoveredItem,
    setHoveredItem,
    canvasRef,
    fileInputRef
  }
}
