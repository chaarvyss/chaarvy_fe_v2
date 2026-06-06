import React, { useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react'

import { useToast, ToastVariants } from 'src/@core/context/toastContext'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import OverlaySpinner from 'src/reusable_components/overlaySpinner'
import { useAddUpdatePdfTemplateMutation, useGetPdfTemplatesQuery } from 'src/store/services/pdfTemplateServices'

import { LeftSidebar } from './components/LeftSidebar'
import PropertiesPanel from './PropertiesPanel'

// --- CONSTANTS ---
const PAGE_SIZES = {
  A4: { width: 794, height: 1123, label: 'A4 (210 × 297 mm)' },
  A5: { width: 559, height: 794, label: 'A5 (148 × 210 mm)' },
  Letter: { width: 816, height: 1056, label: 'Letter (8.5 × 11 in)' },
  Legal: { width: 816, height: 1344, label: 'Legal (8.5 × 14 in)' }
}
const GRID_SIZE = 20
const MIN_SIZE = 10
const ALIGNMENT_THRESHOLD = 5
const SNAP_THRESHOLD = 10
const RESIZE_HANDLE_SIZE = 8
const DELETE_BUTTON_SIZE = 16

const DEFAULT_SIZES = {
  fontSize: 12,
  rectangle: { width: 100, height: 50 },
  circle: { width: 80, height: 80 },
  line: { width: 100, height: 2 },
  dynamic_table: { width: 600, height: 100 },
  image: { width: 150, height: 150 }
}

type ResizeHandleConfig = {
  handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
  top?: number | string
  bottom?: number | string
  left?: number | string
  right?: number | string
  transform?: string
  cursor: string
}

const RESIZE_HANDLES: ResizeHandleConfig[] = [
  { handle: 'nw', top: -4, left: -4, cursor: 'nw-resize' },
  { handle: 'n', top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
  { handle: 'ne', top: -4, right: -4, cursor: 'ne-resize' },
  { handle: 'w', top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' },
  { handle: 'e', top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
  { handle: 'sw', bottom: -4, left: -4, cursor: 'sw-resize' },
  { handle: 's', bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
  { handle: 'se', bottom: -4, right: -4, cursor: 'se-resize' }
]

// --- UTILS ---
const formatHtmlVariables = (html: string) => {
  const temp = document.createElement('div')
  temp.innerHTML = html
  const walk = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT, null)
  let node
  const textNodes: Node[] = []
  while ((node = walk.nextNode())) textNodes.push(node)

  textNodes.forEach(textNode => {
    const text = textNode.nodeValue || ''
    const regex = /\{\{(.*?)\}\}/g
    if (regex.test(text)) {
      const spanWrap = document.createElement('span')
      spanWrap.innerHTML = text.replace(regex, match => {
        const uniqueId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        return `<span id="${uniqueId}" data-dynamic="true" style="color: #e91e63; font-weight: bold; cursor: pointer; padding: 0 2px;">${match}</span>`
      })
      textNode.parentNode?.replaceChild(spanWrap, textNode)
    }
  })

  return temp.innerHTML
}

// --- TYPES ---
type Field = { key: string; label: string; type: 'field' | 'shape' | 'image' | 'image_field' }
type PlacedField = any
type DragState = {
  isDragging: boolean
  primaryItemId: string | null
  startX: number
  startY: number
  offsetX: number
  offsetY: number
  initialPositions: { id: string; x: number; y: number }[] // Needed for Multi-Select Dragging
}
type ResizeState = {
  isResizing: boolean
  itemId: string | null
  handle: string | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

const DesignerPage = () => {
  // --- API ---
  const { data: pdfTemplates } = useGetPdfTemplatesQuery(undefined, { refetchOnMountOrArgChange: true })
  const [savePdfTemplate, { isLoading: isSaving }] = useAddUpdatePdfTemplateMutation()
  const { triggerToast } = useToast()

  // --- STATE ---
  const [placed, setPlaced] = useState<PlacedField[]>([])
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)
  const isInitialLoad = useRef(true)

  const [templateName, setTemplateName] = useState('My Template')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES | 'Custom'>('A4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [customWidth, setCustomWidth] = useState(794)
  const [customHeight, setCustomHeight] = useState(1123)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [showSidebar, setShowSidebar] = useState(true)

  // Display Toggles
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showBorders, setShowBorders] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [showSafeMargins, setShowSafeMargins] = useState(true)

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.15)

  // Interaction State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    primaryItemId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    initialPositions: []
  })
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    itemId: null,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  })
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  // MULTI-SELECT STATE FIX
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [clipboard, setClipboard] = useState<PlacedField[]>([])

  const [editingSpan, setEditingSpan] = useState<{ itemId: string; spanId: string } | null>(null)
  const [guides, setGuides] = useState<{ x?: number; y?: number; type?: string }[]>([])
  const [history, setHistory] = useState<PlacedField[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  const get_available_fields = () => {
    const selected_template = (pdfTemplates ?? []).find(each => each.template_id == selectedTemplateId)
    if (!selected_template) return []

    return selected_template.available_fields ?? []
  }

  const availableItems: Field[] = useMemo(
    () => [
      { key: 'text', label: 'Text Label', type: 'shape' },
      { key: 'rectangle', label: 'Rectangle', type: 'shape' },
      { key: 'circle', label: 'Circle', type: 'shape' },
      { key: 'line', label: 'Line', type: 'shape' },
      { key: 'dynamic_table', label: 'Dynamic Table Area', type: 'shape' },
      { key: 'logo', label: 'Logo/Image', type: 'image' },
      ...get_available_fields()
    ],
    [selectedTemplateId]
  )

  // --- MATH & DIMENSIONS ---
  const getCanvasDimensions = useCallback(() => {
    const isCustom = pageSize === 'Custom'
    const isPortrait = orientation === 'portrait'
    const baseW = isCustom
      ? isPortrait
        ? customWidth
        : customHeight
      : isPortrait
        ? PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES].width
        : PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES].height
    const baseH = isCustom
      ? isPortrait
        ? customHeight
        : customWidth
      : isPortrait
        ? PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES].height
        : PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES].width

    return { width: baseW, height: baseH * totalPages, singlePageHeight: baseH }
  }, [pageSize, orientation, customWidth, customHeight, totalPages])

  const { width: canvasWidth, height: canvasHeight, singlePageHeight } = getCanvasDimensions()

  // --- DATA LOADING & HISTORY ---
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

  const handleSetData = (data: any) => {
    if (!data) return
    if (data.placed && Array.isArray(data.placed)) {
      setPlaced(data.placed)
      saveToHistory(data.placed)
      if (data.name) setTemplateName(data.name)
      if (data.config) {
        if (data.config.pageSize) setPageSize(data.config.pageSize)
        if (data.config.orientation) setOrientation(data.config.orientation)
        if (data.config.totalPages) setTotalPages(data.config.totalPages)
        if (data.config.backgroundImage !== undefined) setBackgroundImage(data.config.backgroundImage)
        if (data.config.backgroundOpacity !== undefined) setBackgroundOpacity(data.config.backgroundOpacity)
      }
    }
  }

  useEffect(() => {
    if (pdfTemplates && pdfTemplates.length > 0 && isInitialLoad.current) {
      isInitialLoad.current = false
      setSelectedTemplateId(pdfTemplates[0].template_id)
      setTemplateName(pdfTemplates[0].template_name)
      const templateHtml =
        typeof pdfTemplates[0].template_html === 'string'
          ? JSON.parse(pdfTemplates[0].template_html)
          : pdfTemplates[0].template_html
      handleSetData(templateHtml)
    }
  }, [pdfTemplates])

  const handleCreateNew = () => {
    setSelectedTemplateId(undefined)
    setTemplateName('New Template')
    setPlaced([])
    setHistory([[]])
    setHistoryIndex(0)
    setPageSize('A4')
    setOrientation('portrait')
    setTotalPages(1)
    setBackgroundImage(null)
    setBackgroundOpacity(0.15)
    setSelectedItems([])
    setEditingItem(null)
  }

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (!id) return handleCreateNew()
    const selected = pdfTemplates?.find((t: any) => t.template_id === id)
    if (selected) {
      setSelectedTemplateId(selected.template_id)
      setTemplateName(selected.template_name)
      const templateHtml =
        typeof selected.template_html === 'string' ? JSON.parse(selected.template_html) : selected.template_html
      handleSetData(templateHtml)
    }
  }

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

  // MULTI-SELECT COPY/PASTE
  const handleCopy = useCallback(() => {
    if (selectedItems.length > 0 && !editingItem) {
      const itemsToCopy = placed.filter(p => selectedItems.includes(p.id))
      setClipboard(itemsToCopy)
    }
  }, [selectedItems, editingItem, placed])

  const handlePaste = useCallback(() => {
    if (clipboard.length > 0 && !editingItem) {
      const newItems = clipboard.map(c => ({
        ...c,
        id: `${c.type}_${Date.now()}_${Math.random()}`,
        x: c.x + 20,
        y: c.y + 20
      }))
      const newPlaced = [...placed, ...newItems]
      setPlaced(newPlaced)
      saveToHistory(newPlaced)
      setSelectedItems(newItems.map(n => n.id))
    }
  }, [clipboard, editingItem, placed, saveToHistory])

  const handleArrowMovement = useCallback(
    (axis: 'x' | 'y', delta: number) => {
      setPlaced(p =>
        p.map(item => {
          if (selectedItems.includes(item.id)) return { ...item, [axis]: Math.max(0, item[axis] + delta) }

          return item
        })
      )
    },
    [selectedItems]
  )

  // --- DROP LOGIC ---
  const handleDragStart = useCallback((e: React.DragEvent, item: Field) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
  }, [])
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const dataString = e.dataTransfer.getData('text/plain')
      if (!dataString) return
      let itemData: Field
      try {
        itemData = JSON.parse(dataString)
      } catch (error) {
        return
      }

      const rect = canvasRef.current!.getBoundingClientRect()
      let x = e.clientX - rect.left
      let y = e.clientY - rect.top
      if (snapToGrid) {
        x = Math.round(x / GRID_SIZE) * GRID_SIZE
        y = Math.round(y / GRID_SIZE) * GRID_SIZE
      }

      const id = `${itemData.key}_${Date.now()}`
      const newItem: PlacedField = {
        id,
        type: itemData.type,
        x: Math.round(x),
        y: Math.round(y),
        fontSize: DEFAULT_SIZES.fontSize,
        visible: true
      }

      if (itemData.type === 'field') {
        newItem.fieldKey = itemData.key
      } else if (itemData.type === 'image_field') {
        newItem.fieldKey = itemData.key
        newItem.width = 100
        newItem.height = 120
      } else if (itemData.type === 'shape') {
        if (itemData.key === 'text') {
          newItem.content = 'Double click to edit text'
          newItem.type = 'text'
          newItem.width = 250
        } else if (itemData.key === 'dynamic_table') {
          newItem.shapeType = 'dynamic_table'
          newItem.width = DEFAULT_SIZES.dynamic_table.width
          newItem.height = DEFAULT_SIZES.dynamic_table.height
          newItem.tableColumns = ['Description', 'Amount']
          newItem.borderStyle = 'dashed'
          newItem.borderWidth = 2
          newItem.borderColor = '#2196F3'
        } else {
          newItem.shapeType = itemData.key
          const sizes = DEFAULT_SIZES[itemData.key as keyof typeof DEFAULT_SIZES]
          if (sizes) {
            newItem.width = (sizes as any).width
            newItem.height = (sizes as any).height
          }
        }
      } else if (itemData.type === 'image') {
        newItem.imageUrl = '/images/logos/logo.png'
        newItem.width = DEFAULT_SIZES.image.width
        newItem.height = DEFAULT_SIZES.image.height
      }

      const newPlaced = [...placed, newItem]
      setPlaced(newPlaced)
      saveToHistory(newPlaced)
      setSelectedItems([id])
    },
    [placed, saveToHistory, snapToGrid]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // MULTI-SELECT DRAG LOGIC
  const handleDragMovement = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !dragState.primaryItemId) return
      const rect = canvas.getBoundingClientRect()

      // 1. Calculate raw movement for the PRIMARY item being dragged
      let newX = e.clientX - rect.left - dragState.offsetX
      let newY = e.clientY - rect.top - dragState.offsetY
      if (snapToGrid) {
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE
      }

      const primaryItem = placed.find(p => p.id === dragState.primaryItemId)
      if (!primaryItem) return

      // 2. Alignment Guides (Only align the primary dragged item to keep UI clean)
      const newGuides: any[] = []
      const itemWidth = primaryItem.width || 100
      const itemHeight = primaryItem.height || 30
      const canvasCenterX = rect.width / 2
      const canvasCenterY = rect.height / 2
      let itemCenterX = newX + itemWidth / 2
      let itemCenterY = newY + itemHeight / 2

      if (Math.abs(itemCenterX - canvasCenterX) < ALIGNMENT_THRESHOLD) {
        newGuides.push({ x: canvasCenterX, type: 'center' })
        if (Math.abs(itemCenterX - canvasCenterX) < SNAP_THRESHOLD) {
          newX = canvasCenterX - itemWidth / 2
          itemCenterX = newX + itemWidth / 2
        }
      }
      if (Math.abs(itemCenterY - canvasCenterY) < ALIGNMENT_THRESHOLD) {
        newGuides.push({ y: canvasCenterY, type: 'center' })
        if (Math.abs(itemCenterY - canvasCenterY) < SNAP_THRESHOLD) {
          newY = canvasCenterY - itemHeight / 2
          itemCenterY = newY + itemHeight / 2
        }
      }

      placed.forEach(otherItem => {
        // Don't align with items currently being dragged!
        if (dragState.initialPositions.some(pos => pos.id === otherItem.id)) return

        const otherWidth = otherItem.width || 100
        const otherHeight = otherItem.height || 30
        const otherCenterX = otherItem.x + otherWidth / 2
        const otherCenterY = otherItem.y + otherHeight / 2
        const alignments = [
          { pos: newX, ref: otherItem.x, axis: 'x' as const },
          { pos: newX + itemWidth, ref: otherItem.x + otherWidth, axis: 'x' as const },
          { pos: itemCenterX, ref: otherCenterX, axis: 'x' as const },
          { pos: newY, ref: otherItem.y, axis: 'y' as const },
          { pos: newY + itemHeight, ref: otherItem.y + otherHeight, axis: 'y' as const },
          { pos: itemCenterY, ref: otherCenterY, axis: 'y' as const }
        ]
        alignments.forEach(({ pos, ref, axis }) => {
          const diff = Math.abs(pos - ref)
          if (diff < ALIGNMENT_THRESHOLD) {
            newGuides.push({ [axis]: ref, type: 'align' })
            if (diff < SNAP_THRESHOLD) {
              if (axis === 'x') {
                if (pos === newX) newX = ref
                else if (pos === newX + itemWidth) newX = ref - itemWidth
                else if (pos === itemCenterX) newX = ref - itemWidth / 2
              } else {
                if (pos === newY) newY = ref
                else if (pos === newY + itemHeight) newY = ref - itemHeight
                else if (pos === itemCenterY) newY = ref - itemHeight / 2
              }
            }
          }
        })
      })
      setGuides(newGuides)

      // 3. Calculate the exact delta distance the primary item moved
      const primaryInitPos = dragState.initialPositions.find(pos => pos.id === dragState.primaryItemId)
      if (!primaryInitPos) return

      const actualDeltaX = newX - primaryInitPos.x
      const actualDeltaY = newY - primaryInitPos.y

      // 4. Apply that exact delta to ALL selected items based on their initial positions
      setPlaced(p =>
        p.map(item => {
          const initPos = dragState.initialPositions.find(pos => pos.id === item.id)
          if (initPos) {
            return {
              ...item,
              x: Math.max(0, initPos.x + actualDeltaX),
              y: Math.max(0, initPos.y + actualDeltaY)
            }
          }

          return item
        })
      )
    },
    [dragState, placed, snapToGrid]
  )

  const handleResizeMovement = useCallback(
    (e: React.MouseEvent) => {
      const deltaX = e.clientX - resizeState.startX
      const deltaY = e.clientY - resizeState.startY
      setPlaced(p =>
        p.map(item => {
          if (item.id === resizeState.itemId) {
            let newWidth = resizeState.startWidth
            let newHeight = resizeState.startHeight
            let newX = item.x
            let newY = item.y
            switch (resizeState.handle) {
              case 'se':
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth + deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight + deltaY)
                break
              case 'sw':
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth - deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight + deltaY)
                newX = item.x + (resizeState.startWidth - newWidth)
                break
              case 'ne':
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth + deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight - deltaY)
                newY = item.y + (resizeState.startHeight - newHeight)
                break
              case 'nw':
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth - deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight - deltaY)
                newX = item.x + (resizeState.startWidth - newWidth)
                newY = item.y + (resizeState.startHeight - newHeight)
                break
              case 'n':
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight - deltaY)
                newY = item.y + (resizeState.startHeight - newHeight)
                break
              case 's':
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight + deltaY)
                break
              case 'e':
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth + deltaX)
                break
              case 'w':
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth - deltaX)
                newX = item.x + (resizeState.startWidth - newWidth)
                break
            }
            if (snapToGrid) {
              newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE
              newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE
            }

            return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
          }

          return item
        })
      )
    },
    [resizeState, snapToGrid]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragState.isDragging && dragState.primaryItemId) handleDragMovement(e)
      else if (resizeState.isResizing && resizeState.itemId) handleResizeMovement(e)
    },
    [dragState, resizeState, handleDragMovement, handleResizeMovement]
  )

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging || resizeState.isResizing) saveToHistory(placed)
    setDragState({
      isDragging: false,
      primaryItemId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      initialPositions: []
    })
    setResizeState({
      isResizing: false,
      itemId: null,
      handle: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0
    })
    setGuides([])
  }, [dragState.isDragging, resizeState.isResizing, placed, saveToHistory])

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()

        return
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()

        return
      }
      if (e.ctrlKey && e.key === 'c' && !editingItem) {
        e.preventDefault()
        handleCopy()

        return
      }
      if (e.ctrlKey && e.key === 'v' && !editingItem) {
        e.preventDefault()
        handlePaste()

        return
      }
      if (selectedItems.length === 0 || editingItem || isPreviewMode) return
      if (e.key === 'Delete') {
        e.preventDefault()
        deleteItems(selectedItems)

        return
      }
      const step = e.shiftKey ? 10 : 1
      const keyMap: any = {
        ArrowUp: { axis: 'y', delta: -step },
        ArrowDown: { axis: 'y', delta: step },
        ArrowLeft: { axis: 'x', delta: -step },
        ArrowRight: { axis: 'x', delta: step }
      }
      const movement = keyMap[e.key]
      if (movement) {
        e.preventDefault()
        handleArrowMovement(movement.axis, movement.delta)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedItems, editingItem, isPreviewMode, handleCopy, handlePaste, handleArrowMovement, undo, redo])

  // --- TEXT SPAN PROPERTIES LOGIC ---
  const updateTextContent = useCallback((id: string, content: string) => {
    setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
  }, [])

  const insertDynamicSpan = (itemId: string, fieldKey: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    let container = range.commonAncestorContainer
    let isInsideEditor = false
    while (container && container !== document.body) {
      if (container.nodeType === Node.ELEMENT_NODE && (container as HTMLElement).id === `text-edit-${itemId}`) {
        isInsideEditor = true
        break
      }
      container = container.parentNode as Node
    }
    if (!isInsideEditor) return
    const span = document.createElement('span')
    span.id = `span_${Date.now()}`
    span.setAttribute('data-dynamic', 'true')
    span.style.color = '#e91e63'
    span.style.fontWeight = 'bold'
    span.style.cursor = 'pointer'
    span.style.padding = '0 2px'
    span.innerText = `{{ dynamic.${fieldKey} }}`
    range.deleteContents()
    range.insertNode(span)
    range.setStartAfter(span)
    range.setEndAfter(span)
    selection.removeAllRanges()
    selection.addRange(range)
    const el = document.getElementById(`text-edit-${itemId}`)
    if (el) updateTextContent(itemId, el.innerHTML)
  }

  const handleSpanClick = (e: React.MouseEvent, itemId: string) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'SPAN' && target.dataset.dynamic === 'true') {
      e.stopPropagation()
      setEditingSpan({ itemId, spanId: target.id })
    }
  }

  const updateSpanStyle = (styleProp: keyof CSSStyleDeclaration, value: string) => {
    if (!editingSpan) return
    const activeDOMSpan = document.getElementById(editingSpan.spanId)
    if (activeDOMSpan) {
      ;(activeDOMSpan.style as any)[styleProp] = value
    }
    setPlaced(prev =>
      prev.map(item => {
        if (item.id === editingSpan.itemId) {
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = item.content || ''
          const targetSpan = tempDiv.querySelector(`#${editingSpan.spanId}`) as HTMLElement
          if (targetSpan) {
            ;(targetSpan.style as any)[styleProp] = value

            return { ...item, content: tempDiv.innerHTML }
          }
        }

        return item
      })
    )
  }

  // --- MULTI-ITEM MANAGEMENT ---
  const updateItemProperty = useCallback((id: string, property: string, value: any) => {
    setPlaced(p => p.map(item => (item.id === id ? { ...item, [property]: value } : item)))
  }, [])

  const deleteItems = useCallback(
    (ids: string[]) => {
      const newPlaced = placed.filter(item => !ids.includes(item.id))
      setPlaced(newPlaced)
      saveToHistory(newPlaced)
      setSelectedItems([])
    },
    [placed, saveToHistory]
  )

  const bringToFront = useCallback(() => {
    if (selectedItems.length === 0) return
    const maxZ = Math.max(...placed.map(item => item.zIndex || 0))
    setPlaced(p => p.map(item => (selectedItems.includes(item.id) ? { ...item, zIndex: maxZ + 1 } : item)))
  }, [selectedItems, placed])

  const sendToBack = useCallback(() => {
    if (selectedItems.length === 0) return
    const minZ = Math.min(...placed.map(item => item.zIndex || 0))
    setPlaced(p => p.map(item => (selectedItems.includes(item.id) ? { ...item, zIndex: minZ - 1 } : item)))
  }, [selectedItems, placed])

  const renderShape = useCallback((p: PlacedField, borderStyle: string) => {
    const bg = p.backgroundColor || 'transparent'

    if (p.shapeType === 'rectangle')
      return <div style={{ width: p.width, height: p.height, border: borderStyle, backgroundColor: bg }} />
    if (p.shapeType === 'circle')
      return (
        <div
          style={{ width: p.width, height: p.height, border: borderStyle, borderRadius: '50%', backgroundColor: bg }}
        />
      )
    if (p.shapeType === 'line')
      return <div style={{ width: p.width, height: p.height, background: p.borderColor || '#333' }} />
    if (p.shapeType === 'dynamic_table') {
      return (
        <div
          style={{
            width: p.width,
            height: p.height,
            border: borderStyle,
            backgroundColor: bg === 'transparent' ? 'rgba(33, 150, 243, 0.05)' : bg,
            display: 'flex',
            flexDirection: 'column',
            color: '#2196F3'
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              borderBottom: '1px solid rgba(33, 150, 243, 0.3)',
              padding: '6px 10px',
              background: 'rgba(33, 150, 243, 0.1)'
            }}
          >
            {p.tableColumns?.map((col: string, i: number) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  fontWeight: 'bold',
                  fontSize: 12,
                  color: '#1976D2',
                  textAlign: i === 0 ? 'left' : 'right'
                }}
              >
                {col}
              </div>
            ))}
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontWeight: 600 }}>Dynamic Table Zone</span>
            <span style={{ fontSize: 11, marginTop: 4 }}>(Content auto-paginates here)</span>
          </div>
        </div>
      )
    }

    return null
  }, [])

  // --- SAVING & UPLOADS ---
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = event => {
        const newItem: PlacedField = {
          id: `uploaded_${Date.now()}`,
          type: 'image',
          imageUrl: event.target?.result as string,
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          fontSize: DEFAULT_SIZES.fontSize,
          visible: true,
          zIndex: placed.length,
          opacity: 1,
          rotation: 0
        }
        const newPlaced = [...placed, newItem]
        setPlaced(newPlaced)
        saveToHistory(newPlaced)
        setSelectedItems([newItem.id])
      }
      reader.readAsDataURL(file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [placed, saveToHistory]
  )

  const handleBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = event => setBackgroundImage(event.target?.result as string)
    reader.readAsDataURL(file)
    if (bgInputRef.current) bgInputRef.current.value = ''
  }, [])

  const saveTemplate = async () => {
    const payload = {
      clientId: 'clientId',
      templateType: 'admission_acknowledgement',
      name: templateName,
      config: {
        canvasBounds: { width: canvasWidth, height: singlePageHeight },
        pageSize,
        orientation,
        totalPages,
        backgroundImage,
        backgroundOpacity
      },
      placed
    }
    savePdfTemplate({
      template_id: selectedTemplateId,
      template_name: templateName,
      template_html: payload,
      available_fields: get_available_fields()
    })
      .unwrap()
      .then(() => {
        triggerToast('Template saved successfully', { variants: ToastVariants.SUCCESS })
      })
      .catch(e => triggerToast(e, { variants: ToastVariants.ERROR }))
  }

  const exportTemplate = useCallback(() => {
    const dataStr = JSON.stringify(
      {
        name: templateName,
        config: {
          canvasBounds: { width: canvasWidth, height: singlePageHeight },
          pageSize,
          orientation,
          totalPages,
          backgroundImage,
          backgroundOpacity
        },
        placed
      },
      null,
      2
    )
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${templateName.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [
    templateName,
    placed,
    canvasWidth,
    singlePageHeight,
    pageSize,
    orientation,
    totalPages,
    backgroundImage,
    backgroundOpacity
  ])

  const importTemplate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string)
        handleSetData(data)
      } catch (error) {
        alert('Invalid template file')
      }
    }
    reader.readAsText(file)
  }, [])

  return (
    <>
      {isSaving && <OverlaySpinner />}
      <div style={{ display: 'flex', gap: 20, padding: 20, position: 'relative' }}>
        {/* FLOATING TEXT PROPERTIES EDITOR */}
        {editingSpan && (
          <div
            style={{
              position: 'absolute',
              right: 280,
              top: 20,
              width: 240,
              background: 'white',
              padding: 16,
              border: '1px solid #ccc',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 2000,
              borderRadius: 8
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: '#333' }}>Variable Settings</h4>
              <button
                onClick={() => setEditingSpan(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#999' }}
              >
                ×
              </button>
            </div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#666' }}>Text Color</label>
            <input
              type='color'
              style={{ width: '100%', marginBottom: 12, cursor: 'pointer' }}
              onChange={e => updateSpanStyle('color', e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#666' }}>Size (px)</label>
                <input
                  type='number'
                  placeholder='e.g. 14'
                  style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
                  onChange={e => updateSpanStyle('fontSize', `${e.target.value}px`)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#666' }}>Weight</label>
                <select
                  style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
                  onChange={e => updateSpanStyle('fontWeight', e.target.value)}
                >
                  <option value='normal'>Normal</option>
                  <option value='bold'>Bold</option>
                  <option value='600'>Semi-Bold</option>
                </select>
              </div>
            </div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#666' }}>Font Family</label>
            <select
              style={{ width: '100%', padding: 6, marginBottom: 12, border: '1px solid #ddd', borderRadius: 4 }}
              onChange={e => updateSpanStyle('fontFamily', e.target.value)}
            >
              <option value='inherit'>Inherit from Box</option>
              <option value='Arial, sans-serif'>Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier</option>
              <option value='Georgia, serif'>Georgia</option>
            </select>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#666' }}>Font Style</label>
            <select
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
              onChange={e => updateSpanStyle('fontStyle', e.target.value)}
            >
              <option value='normal'>Normal</option>
              <option value='italic'>Italic</option>
            </select>
          </div>
        )}

        {/* LEFT SIDEBAR */}
        <LeftSidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          pdfTemplates={pdfTemplates ?? []}
          selectedTemplateId={selectedTemplateId}
          handleTemplateChange={handleTemplateChange}
          availableItems={availableItems}
          templateName={templateName}
          setTemplateName={setTemplateName}
          pageSize={pageSize}
          setPageSize={setPageSize}
          orientation={orientation}
          setOrientation={setOrientation}
          undo={undo}
          redo={redo}
          saveTemplate={saveTemplate}
          exportTemplate={exportTemplate}
          importTemplate={importTemplate}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
          showSafeMargins={showSafeMargins}
          setShowSafeMargins={setShowSafeMargins}
          showBorders={showBorders}
          setShowBorders={setShowBorders}
          handleImageUpload={handleImageUpload}
          handleBackgroundUpload={handleBackgroundUpload}
          backgroundImage={backgroundImage}
          setBackgroundImage={setBackgroundImage}
          backgroundOpacity={backgroundOpacity}
          setBackgroundOpacity={setBackgroundOpacity}
          handleDragStart={handleDragStart}
          customWidth={customWidth}
          setCustomHeight={setCustomHeight}
          customHeight={customHeight}
          setCustomWidth={setCustomWidth}
          totalPages={totalPages}
          setTotalPages={setTotalPages}
          historyIndex={historyIndex}
        />

        {/* CENTER CANVAS */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>
              Canvas (
              {pageSize === 'Custom'
                ? `Custom (${customWidth} × ${customHeight} px)`
                : PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES]?.label}
              )
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => {
                  setIsPreviewMode(!isPreviewMode)
                  setSelectedItems([])
                  setEditingItem(null)
                }}
                style={{
                  padding: '6px 12px',
                  background: isPreviewMode ? '#4CAF50' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 12,
                  marginRight: 16
                }}
              >
                {isPreviewMode ? '✏️ Exit Preview' : '👁️ Preview Mode'}
              </button>

              <button
                onClick={() => setZoom(prev => Math.max(prev - 10, 50))}
                disabled={zoom <= 50}
                style={{
                  padding: '4px 10px',
                  background: zoom <= 50 ? '#e0e0e0' : '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: zoom <= 50 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                −
              </button>
              <button
                onClick={() => setZoom(100)}
                style={{
                  padding: '4px 10px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  minWidth: 50
                }}
              >
                {zoom}%
              </button>
              <button
                onClick={() => setZoom(prev => Math.min(prev + 10, 200))}
                disabled={zoom >= 200}
                style={{
                  padding: '4px 10px',
                  background: zoom >= 200 ? '#e0e0e0' : '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: zoom >= 200 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>

          <div
            style={{
              overflow: 'auto',
              maxHeight: 'calc(90vh - 80px)',
              border: '1px solid #e0e0e0',
              padding: 20,
              background: '#f0f2f5'
            }}
          >
            <div
              ref={canvasRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseDown={() => {
                setSelectedItems([])
                setEditingItem(null)
                setEditingSpan(null)
              }}
              style={{
                position: 'relative',
                width: canvasWidth,
                height: canvasHeight,
                border: '1px solid #ccc',
                margin: 'auto',
                background: 'white',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                cursor: dragState.isDragging ? 'grabbing' : 'default',
                overflow: 'hidden',
                backgroundImage:
                  snapToGrid && !isPreviewMode
                    ? 'linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)'
                    : 'none',
                backgroundSize: snapToGrid && !isPreviewMode ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto'
              }}
            >
              {backgroundImage && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: `${canvasWidth}px ${singlePageHeight}px`,
                    backgroundRepeat: 'repeat-y',
                    backgroundPosition: 'top center',
                    opacity: backgroundOpacity,
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
              )}

              {showSafeMargins && !isPreviewMode && (
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    right: 20,
                    bottom: 20,
                    border: '1px dashed #ff5252',
                    pointerEvents: 'none',
                    zIndex: 999
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: 4,
                      fontSize: 10,
                      color: '#ff5252',
                      fontWeight: 'bold'
                    }}
                  >
                    Print Safe Area
                  </span>
                </div>
              )}

              {Array.from({ length: totalPages - 1 }).map((_, index) => {
                const breakY = singlePageHeight * (index + 1)

                return (
                  <div
                    key={`page-break-${index}`}
                    style={{
                      position: 'absolute',
                      top: breakY,
                      left: 0,
                      right: 0,
                      height: 2,
                      borderTop: '2px dashed #ff5252',
                      zIndex: 0,
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span
                      style={{
                        background: '#ff5252',
                        color: 'white',
                        padding: '2px 8px',
                        fontSize: 10,
                        borderRadius: 10,
                        fontWeight: 'bold'
                      }}
                    >
                      Page {index + 2} Break
                    </span>
                  </div>
                )
              })}

              {[...placed]
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map(p => {
                  const isShape = p.type === 'shape'
                  const isImage = p.type === 'image'
                  const applyWrapperBorder = p.borderWidth > 0 && !isShape && !isImage
                  const applyWrapperBg = !isShape
                  const isSelected = selectedItems.includes(p.id)

                  return (
                    <div
                      key={p.id}
                      draggable={false}
                      onMouseDown={e => {
                        if (isPreviewMode) return
                        e.stopPropagation()
                        if (editingItem === p.id) return

                        // --- MULTI-SELECT CLICK LOGIC ---
                        let newSelection = [...selectedItems]
                        if (e.ctrlKey || e.metaKey) {
                          if (newSelection.includes(p.id)) newSelection = newSelection.filter(id => id !== p.id)
                          else newSelection.push(p.id)
                        } else {
                          if (!newSelection.includes(p.id)) newSelection = [p.id]
                        }
                        setSelectedItems(newSelection)

                        // If the item we just clicked is now selected, start drag mode
                        if (newSelection.includes(p.id)) {
                          setDragState({
                            isDragging: true,
                            primaryItemId: p.id,
                            startX: e.clientX,
                            startY: e.clientY,
                            offsetX: e.clientX - canvasRef.current!.getBoundingClientRect().left - p.x,
                            offsetY: e.clientY - canvasRef.current!.getBoundingClientRect().top - p.y,
                            initialPositions: placed
                              .filter(item => newSelection.includes(item.id))
                              .map(item => ({ id: item.id, x: item.x, y: item.y }))
                          })
                        }
                      }}
                      onDoubleClick={e => {
                        if (isPreviewMode) return
                        e.stopPropagation()
                        setEditingItem(p.id)
                      }}
                      onMouseEnter={() => setHoveredItem(p.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onDragStart={e => e.preventDefault()}
                      style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        fontSize: p.fontSize,
                        padding: '4px 8px',
                        cursor: isPreviewMode ? 'default' : editingItem === p.id ? 'text' : 'grab',
                        userSelect: editingItem === p.id ? 'auto' : 'none',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                        opacity: p.opacity !== undefined ? p.opacity : 1,
                        transform: `rotate(${p.rotation || 0}deg)`,
                        zIndex: p.zIndex || 10,

                        // Actual Element Border
                        border: applyWrapperBorder
                          ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#333'}`
                          : isPreviewMode
                            ? 'transparent'
                            : showBorders
                              ? '1px dashed #ccc'
                              : '1px solid transparent',

                        // Floating Selection Outline
                        outline: isPreviewMode
                          ? 'none'
                          : isSelected && dragState.primaryItemId === p.id
                            ? '2px solid #2196F3' // Dragging color
                            : isSelected
                              ? '2px solid #4CAF50' // Selected color
                              : hoveredItem === p.id && !dragState.isDragging
                                ? '1px solid #2196F3' // Hover color
                                : 'none',
                        outlineOffset: '2px',

                        backgroundColor: isPreviewMode
                          ? applyWrapperBg
                            ? p.backgroundColor || 'transparent'
                            : 'transparent'
                          : isSelected || hoveredItem === p.id
                            ? 'rgba(33, 150, 243, 0.1)'
                            : applyWrapperBg
                              ? p.backgroundColor || 'transparent'
                              : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                        {p.type === 'text' && editingItem === p.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: -35,
                              left: 0,
                              background: '#fff',
                              border: '1px solid #ccc',
                              display: 'flex',
                              gap: 4,
                              padding: '4px 8px',
                              borderRadius: 4,
                              zIndex: 100,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <select
                              style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: 12,
                                cursor: 'pointer'
                              }}
                              onChange={e => {
                                if (e.target.value) insertDynamicSpan(p.id, e.target.value)
                                e.target.value = ''
                              }}
                            >
                              <option value=''>+ Insert Variable Field</option>
                              {availableItems
                                .filter(f => f.type === 'field')
                                .map(f => (
                                  <option key={f.key} value={f.key}>
                                    {f.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}

                        {p.type === 'text' && editingItem === p.id ? (
                          <div
                            id={`text-edit-${p.id}`}
                            contentEditable
                            suppressContentEditableWarning
                            ref={el => {
                              if (el && document.activeElement !== el) {
                                setTimeout(() => el.focus(), 0)
                              }
                            }}
                            onClick={e => handleSpanClick(e, p.id)}
                            onBlur={e => {
                              const cleanHtml = formatHtmlVariables(e.currentTarget.innerHTML)
                              updateTextContent(p.id, cleanHtml)
                              setTimeout(() => setEditingItem(null), 150)
                            }}
                            onKeyDown={e => e.stopPropagation()}
                            style={{
                              border: 'none',
                              outline: '2px solid #2196F3',
                              background: 'transparent',
                              fontSize: p.fontSize,
                              fontFamily: p.fontFamily,
                              fontWeight: p.fontWeight,
                              color: p.color,
                              letterSpacing: p.letterSpacing,
                              textAlign: p.textAlign || 'left',
                              padding: 4,
                              width: p.width ? `${p.width}px` : '200px',
                              minHeight: '20px',
                              wordWrap: 'break-word',
                              whiteSpace: 'pre-wrap',
                              cursor: 'text'
                            }}
                            dangerouslySetInnerHTML={{ __html: p.content || '' }}
                          />
                        ) : p.type === 'text' ? (
                          <div
                            onClick={e => handleSpanClick(e, p.id)}
                            style={{
                              fontFamily: p.fontFamily,
                              fontWeight: p.fontWeight,
                              color: p.color,
                              letterSpacing: p.letterSpacing,
                              textAlign: p.textAlign || 'left',
                              width: p.width ? `${p.width}px` : 'max-content',
                              wordWrap: 'break-word',
                              whiteSpace: 'pre-wrap',
                              padding: 4
                            }}
                            dangerouslySetInnerHTML={{ __html: p.content || 'Text' }}
                          />
                        ) : p.type !== 'shape' && p.type !== 'image' && p.type !== 'image_field' ? (
                          <span
                            style={{
                              fontFamily: p.fontFamily,
                              fontWeight: p.fontWeight,
                              color: p.color,
                              letterSpacing: p.letterSpacing
                            }}
                          >
                            {p.type === 'field' ? (
                              <span
                                style={{
                                  textAlign: p.textAlign || 'left',
                                  display: 'block',
                                  width: p.width ? `${p.width}px` : 'max-content'
                                }}
                              >
                                {'{{ dynamic.' + p.fieldKey + ' }}'}
                              </span>
                            ) : null}
                          </span>
                        ) : null}

                        {(p.type === 'shape' || p.type === 'image') &&
                          renderShape(
                            p,
                            p.borderWidth
                              ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#333'}`
                              : '2px solid #333'
                          )}
                        {p.type === 'image' && (
                          <img
                            src={p.imageUrl}
                            alt='Placed'
                            style={{ width: p.width, height: p.height, objectFit: 'contain' }}
                          />
                        )}

                        {p.type === 'image_field' && (
                          <div
                            style={{
                              width: p.width,
                              height: p.height,
                              border: p.borderWidth
                                ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#333'}`
                                : '2px dashed #9c27b0',
                              background: p.backgroundColor ? 'transparent' : 'rgba(156, 39, 176, 0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9c27b0',
                              fontSize: 10,
                              textAlign: 'center',
                              padding: 4
                            }}
                          >
                            <span style={{ fontSize: 20, marginBottom: 4 }}>📷</span>
                            <span>{`{{ dynamic.${p.fieldKey} }}`}</span>
                          </div>
                        )}
                      </div>

                      {/* We only show delete button & resize handles if exactly ONE item is selected */}
                      {hoveredItem === p.id && !isPreviewMode && selectedItems.length <= 1 && (
                        <span
                          onClick={e => {
                            e.stopPropagation()
                            deleteItems([p.id])
                          }}
                          onMouseEnter={() => setHoveredItem(p.id)}
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: '#fff',
                            background: '#f44336',
                            width: DELETE_BUTTON_SIZE,
                            height: DELETE_BUTTON_SIZE,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            zIndex: 100
                          }}
                        >
                          ×
                        </span>
                      )}

                      {hoveredItem === p.id &&
                        !isPreviewMode &&
                        selectedItems.length <= 1 &&
                        (p.type === 'shape' || p.type === 'image' || p.type === 'text') && (
                          <>
                            {RESIZE_HANDLES.map(({ handle, top, bottom, left, right, transform, cursor }) => (
                              <div
                                key={handle}
                                onMouseDown={e => {
                                  e.stopPropagation()
                                  setResizeState({
                                    isResizing: true,
                                    itemId: p.id,
                                    handle,
                                    startX: e.clientX,
                                    startY: e.clientY,
                                    startWidth: p.width || 200,
                                    startHeight: p.height || 100
                                  })
                                }}
                                style={{
                                  position: 'absolute',
                                  top,
                                  bottom,
                                  left,
                                  right,
                                  transform,
                                  width: RESIZE_HANDLE_SIZE,
                                  height: RESIZE_HANDLE_SIZE,
                                  background: '#2196F3',
                                  cursor,
                                  borderRadius: '50%',
                                  border: '2px solid white'
                                }}
                              />
                            ))}
                          </>
                        )}
                    </div>
                  )
                })}

              {guides.map((guide, idx) => (
                <React.Fragment key={idx}>
                  {guide.x !== undefined && (
                    <div
                      style={{
                        position: 'absolute',
                        left: guide.x,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: guide.type === 'center' ? '#9C27B0' : '#2196F3',
                        pointerEvents: 'none',
                        zIndex: 1000
                      }}
                    />
                  )}
                  {guide.y !== undefined && (
                    <div
                      style={{
                        position: 'absolute',
                        top: guide.y,
                        left: 0,
                        right: 0,
                        height: 1,
                        background: guide.type === 'center' ? '#9C27B0' : '#2196F3',
                        pointerEvents: 'none',
                        zIndex: 1000
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Show Properties panel ONLY if exactly ONE item is selected */}
        {selectedItems.length === 1 && !isPreviewMode && (
          <PropertiesPanel
            item={placed.find(p => p.id === selectedItems[0])!}
            updateItemProperty={updateItemProperty}
            bringToFront={bringToFront}
            sendToBack={sendToBack}
            deleteItem={id => deleteItems([id])}
          />
        )}
      </div>
    </>
  )
}

DesignerPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
export default DesignerPage
