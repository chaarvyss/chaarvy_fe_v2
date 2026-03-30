import React, { useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'

// Constants
const PAGE_SIZES = {
  A4: { width: 794, height: 1123, label: 'A4 (210 × 297 mm)' },
  A5: { width: 559, height: 794, label: 'A5 (148 × 210 mm)' },
  Letter: { width: 816, height: 1056, label: 'Letter (8.5 × 11 in)' },
  Legal: { width: 816, height: 1344, label: 'Legal (8.5 × 14 in)' },
  A3: { width: 1123, height: 1587, label: 'A3 (297 × 420 mm)' },
  Tabloid: { width: 1056, height: 1632, label: 'Tabloid (11 × 17 in)' }
}

const ALIGNMENT_THRESHOLD = 5
const SNAP_THRESHOLD = 3
const RESIZE_HANDLE_SIZE = 8
const DELETE_BUTTON_SIZE = 16
const MIN_SIZE = 20

const DEFAULT_SIZES = {
  rectangle: { width: 120, height: 60 },
  circle: { width: 80, height: 80 },
  line: { width: 100, height: 2 },
  image: { width: 100, height: 100 },
  fontSize: 16
}

const FONT_FAMILIES = [
  'Arial',
  'Arial Black',
  'Brush Script MT',
  'Comic Sans MS',
  'Courier New',
  'Garamond',
  'Georgia',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Palatino Linotype',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded'
]

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: 'lighter', label: 'Lighter' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
  { value: '900', label: '900' }
]

type Field = { key: string; label: string; type: 'field' | 'text' | 'shape' | 'image' }

type PlacedField = {
  id: string
  type: 'field' | 'text' | 'shape' | 'image'
  fieldKey?: string
  content?: string
  shapeType?: 'rectangle' | 'circle' | 'line'
  imageUrl?: string
  x: number
  y: number
  width?: number
  height?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  opacity?: number
  zIndex?: number
  rotation?: number
  borderWidth?: number
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  visible?: boolean
}

type DragState = {
  isDragging: boolean
  itemId: string | null
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}

type ResizeState = {
  isResizing: boolean
  itemId: string | null
  handle: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

const DesignerPage = () => {
  const availableItems: Field[] = useMemo(
    () => [
      // Fields
      { key: 'studentName', label: 'Student Name', type: 'field' },
      { key: 'fatherName', label: 'Father Name', type: 'field' },
      { key: 'dob', label: 'Date of Birth', type: 'field' },
      { key: 'course', label: 'Course', type: 'field' },
      { key: 'admissionDate', label: 'Admission Date', type: 'field' },

      // Shapes
      { key: 'text', label: 'Text Label', type: 'shape' },
      { key: 'rectangle', label: 'Rectangle', type: 'shape' },
      { key: 'circle', label: 'Circle', type: 'shape' },
      { key: 'line', label: 'Line', type: 'shape' },

      // Images
      { key: 'logo', label: 'Logo/Image', type: 'image' }
    ],
    []
  )

  const [placed, setPlaced] = useState<PlacedField[]>([])
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [templateName, setTemplateName] = useState('My Template')
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES | 'Custom'>('A4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [customWidth, setCustomWidth] = useState(794)
  const [customHeight, setCustomHeight] = useState(1123)
  const [zoom, setZoom] = useState(100)
  const [showSidebar, setShowSidebar] = useState(true)
  const clientId = 'CLIENT_ABC' // replace with actual client id from auth

  // Calculate canvas dimensions based on orientation
  const getCanvasDimensions = useCallback(() => {
    const isCustom = pageSize === 'Custom'
    const isPortrait = orientation === 'portrait'

    if (isCustom) {
      return {
        width: isPortrait ? customWidth : customHeight,
        height: isPortrait ? customHeight : customWidth
      }
    }

    const sizes = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES]

    return {
      width: isPortrait ? sizes.width : sizes.height,
      height: isPortrait ? sizes.height : sizes.width
    }
  }, [pageSize, orientation, customWidth, customHeight])

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions()

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    itemId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    itemId: null,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  })
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [guides, setGuides] = useState<{ x?: number; y?: number; type?: string }[]>([])
  const [history, setHistory] = useState<PlacedField[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [clipboard, setClipboard] = useState<PlacedField | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Save to history for undo/redo
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

  // Undo/Redo functionality
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

  // Handle copy action
  const handleCopy = useCallback(() => {
    if (selectedItem && !editingItem) {
      const item = placed.find(p => p.id === selectedItem)
      if (item) setClipboard(item)
    }
  }, [selectedItem, editingItem, placed])

  // Handle paste action
  const handlePaste = useCallback(() => {
    if (clipboard && !editingItem) {
      const newItem = {
        ...clipboard,
        id: `${clipboard.type}_${Date.now()}`,
        x: clipboard.x + 20,
        y: clipboard.y + 20
      }
      const newPlaced = [...placed, newItem]
      setPlaced(newPlaced)
      saveToHistory(newPlaced)
      setSelectedItem(newItem.id)
    }
  }, [clipboard, editingItem, placed, saveToHistory])

  // Handle arrow key movement
  const handleArrowMovement = useCallback(
    (axis: 'x' | 'y', delta: number) => {
      setPlaced(p =>
        p.map(item => {
          if (item.id === selectedItem) {
            const newValue = item[axis] + delta

            return { ...item, [axis]: Math.max(0, newValue) }
          }

          return item
        })
      )
    },
    [selectedItem]
  )

  const handleDragStart = useCallback((e: React.DragEvent, item: Field) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const dataString = e.dataTransfer.getData('text/plain')
      if (!dataString) return // No data to process

      let itemData: Field
      try {
        itemData = JSON.parse(dataString)
      } catch (error) {
        // Invalid JSON data, ignore this drop
        return
      }

      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
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
      } else if (itemData.type === 'shape') {
        if (itemData.key === 'text') {
          newItem.content = 'Enter text here'
          newItem.type = 'text'
        } else {
          newItem.shapeType = itemData.key as 'rectangle' | 'circle' | 'line'
          const sizes = DEFAULT_SIZES[itemData.key as keyof typeof DEFAULT_SIZES]
          if (sizes && typeof sizes === 'object') {
            newItem.width = sizes.width
            newItem.height = sizes.height
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
    },
    [placed, saveToHistory]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Image upload handler
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = event => {
        const imageUrl = event.target?.result as string
        const id = `uploaded_${Date.now()}`
        const newItem: PlacedField = {
          id,
          type: 'image',
          imageUrl,
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
        setSelectedItem(id)
      }
      reader.readAsDataURL(file)

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [placed, saveToHistory]
  )

  const saveTemplate = useCallback(() => {
    const payload = {
      clientId,
      name: templateName,
      templateType: 'admission_acknowledgement',
      config: { placed }
    }

    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        alert('Saved: ' + data.id)
      })
      .catch(console.error)
  }, [clientId, templateName, placed])

  const handleItemMouseDown = useCallback((e: React.MouseEvent, item: PlacedField) => {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    setDragState({
      isDragging: true,
      itemId: item.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: clickX - item.x,
      offsetY: clickY - item.y
    })
  }, [])

  const handleItemClick = useCallback((e: React.MouseEvent, item: PlacedField) => {
    e.stopPropagation()
    setSelectedItem(item.id)
  }, [])

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, item: PlacedField, handle: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w') => {
      e.stopPropagation()
      setResizeState({
        isResizing: true,
        itemId: item.id,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: item.width || 100,
        startHeight: item.height || 100
      })
    },
    []
  )

  // Calculate alignment guides and snap position
  const calculateAlignmentGuides = useCallback(
    (newX: number, newY: number, itemWidth: number, itemHeight: number, rect: DOMRect) => {
      const newGuides: { x?: number; y?: number; type?: string }[] = []
      let finalX = newX
      let finalY = newY

      const canvasCenterX = rect.width / 2
      const canvasCenterY = rect.height / 2
      const itemCenterX = newX + itemWidth / 2
      const itemCenterY = newY + itemHeight / 2

      // Check center alignment
      if (Math.abs(itemCenterX - canvasCenterX) < ALIGNMENT_THRESHOLD) {
        newGuides.push({ x: canvasCenterX, type: 'center' })
        if (Math.abs(itemCenterX - canvasCenterX) < SNAP_THRESHOLD) {
          finalX = canvasCenterX - itemWidth / 2
        }
      }

      if (Math.abs(itemCenterY - canvasCenterY) < ALIGNMENT_THRESHOLD) {
        newGuides.push({ y: canvasCenterY, type: 'center' })
        if (Math.abs(itemCenterY - canvasCenterY) < SNAP_THRESHOLD) {
          finalY = canvasCenterY - itemHeight / 2
        }
      }

      return { finalX, finalY, newGuides }
    },
    []
  )

  // Check alignment with other items
  const calculateItemAlignments = useCallback(
    (newX: number, newY: number, itemWidth: number, itemHeight: number, dragItemId: string) => {
      const newGuides: { x?: number; y?: number; type?: string }[] = []
      let finalX = newX
      let finalY = newY

      const itemCenterX = newX + itemWidth / 2
      const itemCenterY = newY + itemHeight / 2

      placed.forEach(item => {
        if (item.id === dragItemId) return

        const otherWidth = item.width || 100
        const otherHeight = item.height || 30
        const otherCenterX = item.x + otherWidth / 2
        const otherCenterY = item.y + otherHeight / 2

        const alignments = [
          { pos: newX, ref: item.x, axis: 'x' as const, type: 'align' },
          { pos: newX + itemWidth, ref: item.x + otherWidth, axis: 'x' as const, type: 'align' },
          { pos: newY, ref: item.y, axis: 'y' as const, type: 'align' },
          { pos: newY + itemHeight, ref: item.y + otherHeight, axis: 'y' as const, type: 'align' },
          { pos: itemCenterX, ref: otherCenterX, axis: 'x' as const, type: 'align' },
          { pos: itemCenterY, ref: otherCenterY, axis: 'y' as const, type: 'align' }
        ]

        alignments.forEach(({ pos, ref, axis }) => {
          const diff = Math.abs(pos - ref)
          if (diff < ALIGNMENT_THRESHOLD) {
            newGuides.push({ [axis]: ref, type: 'align' })
            if (diff < SNAP_THRESHOLD) {
              if (axis === 'x') {
                if (pos === newX) finalX = ref
                else if (pos === newX + itemWidth) finalX = ref - itemWidth
                else if (pos === itemCenterX) finalX = ref - itemWidth / 2
              } else {
                if (pos === newY) finalY = ref
                else if (pos === newY + itemHeight) finalY = ref - itemHeight
                else if (pos === itemCenterY) finalY = ref - itemHeight / 2
              }
            }
          }
        })
      })

      return { finalX, finalY, newGuides }
    },
    [placed]
  )

  // Handle drag movement with alignment
  const handleDragMovement = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      let newX = e.clientX - rect.left - dragState.offsetX
      let newY = e.clientY - rect.top - dragState.offsetY

      const currentItem = placed.find(p => p.id === dragState.itemId)
      if (!currentItem) return

      const itemWidth = currentItem.width || 100
      const itemHeight = currentItem.height || 30

      // Get center alignment guides
      const centerGuidesResult = calculateAlignmentGuides(newX, newY, itemWidth, itemHeight, rect)
      newX = centerGuidesResult.finalX
      newY = centerGuidesResult.finalY

      // Get item alignment guides
      const itemGuidesResult = calculateItemAlignments(newX, newY, itemWidth, itemHeight, dragState.itemId!)
      newX = itemGuidesResult.finalX
      newY = itemGuidesResult.finalY

      const allGuides = [...centerGuidesResult.newGuides, ...itemGuidesResult.newGuides]
      setGuides(allGuides)

      setPlaced(p =>
        p.map(item => {
          if (item.id === dragState.itemId) {
            const maxX = rect.width - itemWidth
            const maxY = rect.height - itemHeight

            return {
              ...item,
              x: Math.max(0, Math.min(newX, maxX)),
              y: Math.max(0, Math.min(newY, maxY))
            }
          }

          return item
        })
      )
    },
    [dragState, placed, calculateAlignmentGuides, calculateItemAlignments]
  )

  // Handle resize with dimension updates
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

            const handle = resizeState.handle
            switch (handle) {
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

            return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
          }

          return item
        })
      )
    },
    [resizeState]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragState.isDragging && dragState.itemId) {
        handleDragMovement(e)
      } else if (resizeState.isResizing && resizeState.itemId) {
        handleResizeMovement(e)
      }
    },
    [dragState, resizeState, handleDragMovement, handleResizeMovement]
  )

  const handleMouseUp = useCallback(() => {
    // Save to history if we were dragging or resizing
    if (dragState.isDragging || resizeState.isResizing) {
      saveToHistory(placed)
    }

    setDragState({
      isDragging: false,
      itemId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
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

  const deleteItem = useCallback(
    (id: string) => {
      const newPlaced = placed.filter(item => item.id !== id)
      setPlaced(newPlaced)
      saveToHistory(newPlaced)
      if (selectedItem === id) setSelectedItem(null)
    },
    [selectedItem, placed, saveToHistory]
  )

  // Keyboard controls for arrow key movement, copy/paste, undo/redo
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

      if (!selectedItem || editingItem) return

      if (e.key === 'Delete') {
        e.preventDefault()
        deleteItem(selectedItem)

        return
      }

      const step = e.shiftKey ? 10 : 1
      const keyMap: Record<string, { axis: 'x' | 'y'; delta: number }> = {
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
  }, [selectedItem, editingItem, handleCopy, handlePaste, handleArrowMovement, undo, redo, deleteItem])

  const updateTextContent = useCallback((id: string, content: string) => {
    setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
  }, [])

  const updateItemProperty = useCallback((id: string, property: keyof PlacedField, value: any) => {
    setPlaced(p => p.map(item => (item.id === id ? { ...item, [property]: value } : item)))
  }, [])

  // Z-Index controls
  const bringToFront = useCallback(() => {
    if (!selectedItem) return
    const maxZ = Math.max(...placed.map(item => item.zIndex || 0))
    updateItemProperty(selectedItem, 'zIndex', maxZ + 1)
  }, [selectedItem, placed, updateItemProperty])

  const sendToBack = useCallback(() => {
    if (!selectedItem) return
    const minZ = Math.min(...placed.map(item => item.zIndex || 0))
    updateItemProperty(selectedItem, 'zIndex', minZ - 1)
  }, [selectedItem, placed, updateItemProperty])

  // Export template as JSON
  const exportTemplate = useCallback(() => {
    const dataStr = JSON.stringify({ name: templateName, placed }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${templateName.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [templateName, placed])

  // Import template from JSON
  const importTemplate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.placed && Array.isArray(data.placed)) {
            setPlaced(data.placed)
            saveToHistory(data.placed)
            if (data.name) setTemplateName(data.name)
          }
        } catch (error) {
          alert('Invalid template file')
        }
      }
      reader.readAsText(file)
    },
    [saveToHistory]
  )

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 10, 200))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 10, 50))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(100)
  }, [])

  // Render shape element based on shapeType
  const renderShape = useCallback((p: PlacedField, borderStyle: string) => {
    if (p.shapeType === 'rectangle') {
      return <div style={{ width: p.width, height: p.height, border: borderStyle }} />
    }
    if (p.shapeType === 'circle') {
      return <div style={{ width: p.width, height: p.height, border: borderStyle, borderRadius: '50%' }} />
    }
    if (p.shapeType === 'line') {
      return <div style={{ width: p.width, height: p.height, background: p.borderColor || '#333' }} />
    }

    return null
  }, [])

  // Get content based on item type
  const getItemContent = useCallback(
    (p: PlacedField) => {
      if (p.type === 'field') {
        return <span style={{ textAlign: p.textAlign || 'left' }}>{'{{' + p.fieldKey + '}}'}</span>
      }
      if (p.type === 'text') {
        return <span style={{ textAlign: p.textAlign || 'left' }}>{p.content || 'Text'}</span>
      }
      if (p.type === 'shape') {
        const borderStyle = p.borderWidth
          ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#333'}`
          : '2px solid #333'

        return renderShape(p, borderStyle)
      }
      if (p.type === 'image') {
        return <img src={p.imageUrl} alt='Placed' style={{ width: p.width, height: p.height, objectFit: 'contain' }} />
      }

      return null
    },
    [renderShape]
  )

  // Render properties panel for selected item
  const renderPropertiesPanel = useCallback(() => {
    const item = placed.find(p => p.id === selectedItem)
    if (!item) return null

    return (
      <div
        style={{
          width: 280,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderLeft: '1px solid #ddd',
          paddingLeft: 20
        }}
      >
        <h3 style={{ marginTop: 0 }}>Properties</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
            Position X
          </label>
          <input
            type='number'
            value={Math.round(item.x)}
            onChange={e => updateItemProperty(item.id, 'x', Number(e.target.value))}
            style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
            Position Y
          </label>
          <input
            type='number'
            value={Math.round(item.y)}
            onChange={e => updateItemProperty(item.id, 'y', Number(e.target.value))}
            style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
          />
        </div>

        {(item.type === 'shape' || item.type === 'image' || item.type === 'text') && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                Width
              </label>
              <input
                type='number'
                value={Math.round(item.width || 0)}
                onChange={e => updateItemProperty(item.id, 'width', Number(e.target.value))}
                style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                Height
              </label>
              <input
                type='number'
                value={Math.round(item.height || 0)}
                onChange={e => updateItemProperty(item.id, 'height', Number(e.target.value))}
                style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>
          </>
        )}

        {renderTextProperties(item)}
        {renderOpacityRotation(item)}
        {renderBorderProperties(item)}
        {renderLayerControls()}
        {renderDeleteButton(item)}
      </div>
    )
  }, [selectedItem, placed, updateItemProperty])

  // Render text-specific properties
  const renderTextProperties = useCallback(
    (item: PlacedField) => {
      if (item.type !== 'text' && item.type !== 'field') return null

      return (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Font Size
            </label>
            <input
              type='number'
              value={item.fontSize || 16}
              onChange={e => updateItemProperty(item.id, 'fontSize', Number(e.target.value))}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Font Family
            </label>
            <select
              value={item.fontFamily || 'Arial'}
              onChange={e => updateItemProperty(item.id, 'fontFamily', e.target.value)}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
            >
              {FONT_FAMILIES.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Font Weight
            </label>
            <select
              value={item.fontWeight || 'normal'}
              onChange={e => updateItemProperty(item.id, 'fontWeight', e.target.value)}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
            >
              {FONT_WEIGHTS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Color
            </label>
            <input
              type='color'
              value={item.color || '#000000'}
              onChange={e => updateItemProperty(item.id, 'color', e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: 2,
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Letter Spacing (px)
            </label>
            <input
              type='number'
              value={item.letterSpacing || 0}
              onChange={e => updateItemProperty(item.id, 'letterSpacing', Number(e.target.value))}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
              step='0.1'
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Text Alignment
            </label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['left', 'center', 'right', 'justify'].map(align => (
                <button
                  key={align}
                  onClick={() => updateItemProperty(item.id, 'textAlign', align as any)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    background: item.textAlign === align ? '#2196F3' : '#f9f9f9',
                    color: item.textAlign === align ? 'white' : '#333',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    textTransform: 'capitalize'
                  }}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </>
      )
    },
    [updateItemProperty]
  )

  // Render opacity and rotation controls
  const renderOpacityRotation = useCallback(
    (item: PlacedField) => {
      return (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Opacity ({((item.opacity !== undefined ? item.opacity : 1) * 100).toFixed(0)}%)
            </label>
            <input
              type='range'
              min='0'
              max='1'
              step='0.01'
              value={item.opacity !== undefined ? item.opacity : 1}
              onChange={e => updateItemProperty(item.id, 'opacity', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Rotation (degrees)
            </label>
            <input
              type='number'
              min='0'
              max='360'
              value={item.rotation || 0}
              onChange={e => updateItemProperty(item.id, 'rotation', Number(e.target.value))}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>
        </>
      )
    },
    [updateItemProperty]
  )

  // Render border properties
  const renderBorderProperties = useCallback(
    (item: PlacedField) => {
      if (!(item.type === 'shape' || item.type === 'text' || item.type === 'field')) return null

      return (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
              Border Width (px)
            </label>
            <input
              type='number'
              min='0'
              value={item.borderWidth || 0}
              onChange={e => updateItemProperty(item.id, 'borderWidth', Number(e.target.value))}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>

          {item.borderWidth && item.borderWidth > 0 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                  Border Color
                </label>
                <input
                  type='color'
                  value={item.borderColor || '#333333'}
                  onChange={e => updateItemProperty(item.id, 'borderColor', e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: 2,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                  Border Style
                </label>
                <select
                  value={item.borderStyle || 'solid'}
                  onChange={e => updateItemProperty(item.id, 'borderStyle', e.target.value as any)}
                  style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
                >
                  <option value='solid'>Solid</option>
                  <option value='dashed'>Dashed</option>
                  <option value='dotted'>Dotted</option>
                </select>
              </div>
            </>
          )}
        </>
      )
    },
    [updateItemProperty]
  )

  // Render layer controls
  const renderLayerControls = useCallback(() => {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 500, color: '#666' }}>
          Layer Order
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={bringToFront}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            ↑ To Front
          </button>
          <button
            onClick={sendToBack}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            ↓ To Back
          </button>
        </div>
      </div>
    )
  }, [bringToFront, sendToBack])

  // Render delete button
  const renderDeleteButton = useCallback(
    (item: PlacedField) => {
      return (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #ddd' }}>
          <button
            onClick={() => deleteItem(item.id)}
            style={{
              width: '100%',
              padding: 8,
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Delete Item
          </button>
        </div>
      )
    },
    [deleteItem]
  )

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, position: 'relative' }}>
      {/* Left Sidebar - Elements */}
      <div
        style={{
          width: showSidebar ? 240 : 60,
          maxHeight: '90vh',
          overflowY: 'auto',
          transition: 'width 0.3s ease',
          position: 'relative'
        }}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            padding: '4px 8px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            zIndex: 10
          }}
          title={showSidebar ? 'Minimize Sidebar' : 'Expand Sidebar'}
        >
          {showSidebar ? '◀' : '▶'}
        </button>

        {showSidebar ? (
          <>
            <h3 style={{ marginTop: 0 }}>Elements</h3>

            <h4 style={{ fontSize: 14, color: '#666', marginTop: 16, marginBottom: 8 }}>Fields</h4>
            {availableItems
              .filter(f => f.type === 'field')
              .map(f => (
                <div
                  key={f.key}
                  draggable
                  onDragStart={e => handleDragStart(e, f)}
                  style={{
                    padding: 8,
                    border: '1px solid #ddd',
                    marginBottom: 8,
                    cursor: 'grab',
                    background: '#f9f9f9',
                    borderRadius: 4
                  }}
                >
                  {f.label}
                </div>
              ))}

            <h4 style={{ fontSize: 14, color: '#666', marginTop: 16, marginBottom: 8 }}>Shapes</h4>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {availableItems
                .filter(f => f.type === 'shape')
                .map(f => (
                  <div
                    key={f.key}
                    draggable
                    onDragStart={e => handleDragStart(e, f)}
                    style={{
                      padding: 8,
                      cursor: 'grab',
                      background: '#f9f9f9',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      borderRadius: 4,
                      minHeight: 50,
                      gap: 4
                    }}
                  >
                    {f.key === 'text' && <span style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>abc</span>}
                    {f.key === 'rectangle' && <div style={{ width: 20, height: 14, border: '2px solid #333' }} />}
                    {f.key === 'circle' && (
                      <div style={{ width: 18, height: 18, border: '2px solid #333', borderRadius: '50%' }} />
                    )}
                    {f.key === 'line' && <div style={{ width: 24, height: 2, background: '#333' }} />}
                  </div>
                ))}
            </div>

            <h4 style={{ fontSize: 14, color: '#666', marginTop: 16, marginBottom: 8 }}>Images</h4>
            {availableItems
              .filter(f => f.type === 'image')
              .map(f => (
                <div
                  key={f.key}
                  draggable
                  onDragStart={e => handleDragStart(e, f)}
                  style={{
                    padding: 8,
                    border: '1px solid #ddd',
                    marginBottom: 8,
                    cursor: 'grab',
                    background: '#f9f9f9',
                    borderRadius: 4
                  }}
                >
                  {f.label}
                </div>
              ))}

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #2196F3',
                background: 'white',
                color: '#2196F3',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                marginTop: 4
              }}
            >
              📁 Upload Image
            </button>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <h4 style={{ fontSize: 14, color: '#666', marginTop: 16, marginBottom: 8 }}>Actions</h4>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                style={{
                  flex: 1,
                  padding: 6,
                  background: historyIndex === 0 ? '#e0e0e0' : '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: historyIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 12
                }}
                title='Undo (Ctrl+Z)'
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                style={{
                  flex: 1,
                  padding: 6,
                  background: historyIndex >= history.length - 1 ? '#e0e0e0' : '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: 12
                }}
                title='Redo (Ctrl+Y)'
              >
                ↷ Redo
              </button>
            </div>

            <button
              onClick={exportTemplate}
              style={{
                width: '100%',
                padding: 8,
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 8
              }}
            >
              💾 Export Template
            </button>

            <input type='file' accept='.json' onChange={importTemplate} style={{ display: 'none' }} id='import-input' />
            <button
              onClick={() => document.getElementById('import-input')?.click()}
              style={{
                width: '100%',
                padding: 8,
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500
              }}
            >
              📂 Import Template
            </button>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Page Size</label>
              <select
                value={pageSize}
                onChange={e => setPageSize(e.target.value as keyof typeof PAGE_SIZES | 'Custom')}
                style={{ width: '100%', padding: 8, marginBottom: 12, border: '1px solid #ddd', borderRadius: 4 }}
              >
                {Object.entries(PAGE_SIZES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
                <option value='Custom'>Custom Size</option>
              </select>

              {pageSize === 'Custom' && (
                <>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                    Width (px)
                  </label>
                  <input
                    type='number'
                    value={customWidth}
                    onChange={e => setCustomWidth(Number(e.target.value))}
                    style={{ width: '100%', padding: 6, marginBottom: 8, border: '1px solid #ddd', borderRadius: 4 }}
                    min='100'
                  />
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                    Height (px)
                  </label>
                  <input
                    type='number'
                    value={customHeight}
                    onChange={e => setCustomHeight(Number(e.target.value))}
                    style={{ width: '100%', padding: 6, marginBottom: 12, border: '1px solid #ddd', borderRadius: 4 }}
                    min='100'
                  />
                </>
              )}

              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Orientation</label>
              <select
                value={orientation}
                onChange={e => setOrientation(e.target.value as 'portrait' | 'landscape')}
                style={{ width: '100%', padding: 8, marginBottom: 12, border: '1px solid #ddd', borderRadius: 4 }}
              >
                <option value='portrait'>Portrait</option>
                <option value='landscape'>Landscape</option>
              </select>

              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Template Name</label>
              <input
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 12, border: '1px solid #ddd', borderRadius: 4 }}
              />
              <button
                onClick={saveTemplate}
                style={{
                  width: '100%',
                  padding: 10,
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Save Template
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 50 }}>
            {/* Minimized icons */}
            <div
              title='Fields'
              style={{ fontSize: 20, cursor: 'pointer', padding: 8, borderRadius: 4, background: '#f9f9f9' }}
            >
              📝
            </div>
            <div
              title='Shapes'
              style={{ fontSize: 20, cursor: 'pointer', padding: 8, borderRadius: 4, background: '#f9f9f9' }}
            >
              ▢
            </div>
            <div
              title='Images'
              style={{ fontSize: 20, cursor: 'pointer', padding: 8, borderRadius: 4, background: '#f9f9f9' }}
            >
              🖼️
            </div>
            <div
              title='Upload'
              style={{ fontSize: 20, cursor: 'pointer', padding: 8, borderRadius: 4, background: '#f9f9f9' }}
              onClick={() => fileInputRef.current?.click()}
            >
              📁
            </div>
            <hr style={{ width: '80%', border: 'none', borderTop: '1px solid #ddd' }} />
            <div
              title='Undo'
              onClick={undo}
              style={{
                fontSize: 20,
                cursor: historyIndex === 0 ? 'not-allowed' : 'pointer',
                padding: 8,
                borderRadius: 4,
                background: historyIndex === 0 ? '#e0e0e0' : '#f9f9f9',
                opacity: historyIndex === 0 ? 0.5 : 1
              }}
            >
              ↶
            </div>
            <div
              title='Redo'
              onClick={redo}
              style={{
                fontSize: 20,
                cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                padding: 8,
                borderRadius: 4,
                background: historyIndex >= history.length - 1 ? '#e0e0e0' : '#f9f9f9',
                opacity: historyIndex >= history.length - 1 ? 0.5 : 1
              }}
            >
              ↷
            </div>
            <div
              title='Export'
              onClick={exportTemplate}
              style={{
                fontSize: 20,
                cursor: 'pointer',
                padding: 8,
                borderRadius: 4,
                background: '#4CAF50',
                color: 'white'
              }}
            >
              💾
            </div>
            <div
              title='Import'
              onClick={() => document.getElementById('import-input')?.click()}
              style={{
                fontSize: 20,
                cursor: 'pointer',
                padding: 8,
                borderRadius: 4,
                background: '#FF9800',
                color: 'white'
              }}
            >
              📂
            </div>
          </div>
        )}
      </div>

      {/* Center - Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>
            Canvas (
            {pageSize === 'Custom' ? `Custom (${customWidth} × ${customHeight} px)` : PAGE_SIZES[pageSize].label} -{' '}
            {orientation === 'portrait' ? 'Portrait' : 'Landscape'})
          </h3>

          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={zoomOut}
              disabled={zoom <= 50}
              style={{
                padding: '6px 12px',
                background: zoom <= 50 ? '#e0e0e0' : '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: zoom <= 50 ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 'bold'
              }}
              title='Zoom Out'
            >
              −
            </button>
            <button
              onClick={resetZoom}
              style={{
                padding: '6px 12px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                minWidth: 60
              }}
              title='Reset Zoom'
            >
              {zoom}%
            </button>
            <button
              onClick={zoomIn}
              disabled={zoom >= 200}
              style={{
                padding: '6px 12px',
                background: zoom >= 200 ? '#e0e0e0' : '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: zoom >= 200 ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 'bold'
              }}
              title='Zoom In'
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
            background: '#f5f5f5'
          }}
        >
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'relative',
              width: canvasWidth,
              height: canvasHeight,
              border: '1px solid #ccc',
              background: 'white',
              cursor: dragState.isDragging ? 'grabbing' : 'default',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              margin: 'auto'
            }}
          >
            {placed
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map(p => (
                <div
                  key={p.id}
                  draggable={false}
                  onClick={e => handleItemClick(e, p)}
                  onMouseDown={e => handleItemMouseDown(e, p)}
                  onMouseEnter={() => setHoveredItem(p.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onDragStart={e => e.preventDefault()}
                  style={{
                    position: 'absolute',
                    left: p.x,
                    top: p.y,
                    fontSize: p.fontSize,
                    cursor: 'grab',
                    userSelect: 'none',
                    padding: '4px 8px',
                    border:
                      dragState.itemId === p.id
                        ? '2px solid #2196F3'
                        : selectedItem === p.id
                          ? '2px solid #4CAF50'
                          : hoveredItem === p.id
                            ? '1px solid #2196F3'
                            : p.borderWidth
                              ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#333'}`
                              : '1px dashed #ccc',
                    background:
                      dragState.itemId === p.id
                        ? 'rgba(33, 150, 243, 0.1)'
                        : hoveredItem === p.id
                          ? 'rgba(33, 150, 243, 0.05)'
                          : 'transparent',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    opacity: p.opacity !== undefined ? p.opacity : 1,
                    transform: `rotate(${p.rotation || 0}deg)`,
                    zIndex: p.zIndex || 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.type === 'text' && editingItem === p.id ? (
                      <input
                        autoFocus
                        value={p.content || ''}
                        onChange={e => updateTextContent(p.id, e.target.value)}
                        onBlur={() => setEditingItem(null)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            setEditingItem(null)
                          }
                        }}
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: p.fontSize,
                          fontFamily: p.fontFamily,
                          fontWeight: p.fontWeight,
                          color: p.color,
                          letterSpacing: p.letterSpacing,
                          padding: 0,
                          width: '100%'
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : p.type === 'text' ? (
                      <span
                        onDoubleClick={() => setEditingItem(p.id)}
                        style={{
                          fontFamily: p.fontFamily,
                          fontWeight: p.fontWeight,
                          color: p.color,
                          letterSpacing: p.letterSpacing
                        }}
                      >
                        {getItemContent(p)}
                      </span>
                    ) : p.type !== 'shape' && p.type !== 'image' ? (
                      <span
                        style={{
                          fontFamily: p.fontFamily,
                          fontWeight: p.fontWeight,
                          color: p.color,
                          letterSpacing: p.letterSpacing
                        }}
                      >
                        {getItemContent(p)}
                      </span>
                    ) : null}
                    {(p.type === 'shape' || p.type === 'image') && getItemContent(p)}
                  </div>

                  {/* Delete Button */}
                  {hoveredItem === p.id && (
                    <span
                      onClick={e => {
                        e.stopPropagation()
                        deleteItem(p.id)
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
                        zIndex: 10
                      }}
                      title='Remove'
                    >
                      ×
                    </span>
                  )}

                  {/* Resize Handles */}
                  {hoveredItem === p.id && (p.type === 'shape' || p.type === 'image' || p.type === 'text') && (
                    <>
                      {/* Corner handles */}
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 'se')}
                        style={{
                          position: 'absolute',
                          right: -4,
                          bottom: -4,
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 'se-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 'sw')}
                        style={{
                          position: 'absolute',
                          left: -4,
                          bottom: -4,
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 'sw-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 'ne')}
                        style={{
                          position: 'absolute',
                          right: -4,
                          top: -4,
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 'ne-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 'nw')}
                        style={{
                          position: 'absolute',
                          left: -4,
                          top: -4,
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 'nw-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                      {/* Edge handles */}
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 'n')}
                        style={{
                          position: 'absolute',
                          top: -4,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 'n-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 's')}
                        style={{
                          position: 'absolute',
                          bottom: -4,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 's-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 'e')}
                        style={{
                          position: 'absolute',
                          right: -4,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 'e-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                      <div
                        onMouseDown={e => handleResizeMouseDown(e, p, 'w')}
                        style={{
                          position: 'absolute',
                          left: -4,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: RESIZE_HANDLE_SIZE,
                          height: RESIZE_HANDLE_SIZE,
                          background: '#2196F3',
                          cursor: 'w-resize',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                      />
                    </>
                  )}
                </div>
              ))}

            {/* Alignment guides */}
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
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => window.open('/api/templates/preview?clientId=' + clientId)}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Preview / Download PDF
          </button>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      {selectedItem && renderPropertiesPanel()}
    </div>
  )
}

DesignerPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default DesignerPage
