import React, { useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'

import {
  PAGE_SIZES,
  RESIZE_HANDLE_SIZE,
  DELETE_BUTTON_SIZE,
  MIN_SIZE,
  GRID_SIZE,
  DEFAULT_SIZES,
  Field,
  PlacedField,
  DragState,
  ResizeState,
  ALIGNMENT_THRESHOLD,
  SNAP_THRESHOLD
} from './designerConstants'
import PropertiesPanel from './PropertiesPanel'

const DesignerPage = () => {
  const availableItems: Field[] = useMemo(
    () => [
      { key: 'studentName', label: 'Student Name', type: 'field' },
      { key: 'fatherName', label: 'Father Name', type: 'field' },
      { key: 'dob', label: 'Date of Birth', type: 'field' },
      { key: 'course', label: 'Course', type: 'field' },
      { key: 'admissionDate', label: 'Admission Date', type: 'field' },
      { key: 'receipt_number', label: 'Receipt Number', type: 'field' },
      { key: 'transaction_id', label: 'Transaction ID', type: 'field' },
      { key: 'date_of_payment', label: 'Date of Payment', type: 'field' },
      { key: 'prepared_by', label: 'Prepared By', type: 'field' },
      { key: 'printed_on', label: 'Printed On', type: 'field' },
      { key: 'text', label: 'Text Label', type: 'shape' },
      { key: 'rectangle', label: 'Rectangle', type: 'shape' },
      { key: 'circle', label: 'Circle', type: 'shape' },
      { key: 'line', label: 'Line', type: 'shape' },
      { key: 'dynamic_table', label: 'Dynamic Table Area', type: 'shape' },
      { key: 'logo', label: 'Logo/Image', type: 'image' }
    ],
    []
  )

  const [placed, setPlaced] = useState<PlacedField[]>([])
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  const [templateName, setTemplateName] = useState('My Template')
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES | 'Custom'>('A4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [customWidth, setCustomWidth] = useState(794)
  const [customHeight, setCustomHeight] = useState(1123)
  const [zoom, setZoom] = useState(100)
  const [showSidebar, setShowSidebar] = useState(true)

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.15)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [showSafeMargins, setShowSafeMargins] = useState(true)

  const clientId = 'CLIENT_ABC'

  const getCanvasDimensions = useCallback(() => {
    const isCustom = pageSize === 'Custom'
    const isPortrait = orientation === 'portrait'
    if (isCustom)
      return { width: isPortrait ? customWidth : customHeight, height: isPortrait ? customHeight : customWidth }
    const sizes = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES]

    return { width: isPortrait ? sizes.width : sizes.height, height: isPortrait ? sizes.height : sizes.width }
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
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [guides, setGuides] = useState<{ x?: number; y?: number; type?: string }[]>([])
  const [history, setHistory] = useState<PlacedField[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [clipboard, setClipboard] = useState<PlacedField | null>(null)

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

  const handleCopy = useCallback(() => {
    if (selectedItem && !editingItem) {
      const item = placed.find(p => p.id === selectedItem)
      if (item) setClipboard(item)
    }
  }, [selectedItem, editingItem, placed])
  const handlePaste = useCallback(() => {
    if (clipboard && !editingItem) {
      const newItem = { ...clipboard, id: `${clipboard.type}_${Date.now()}`, x: clipboard.x + 20, y: clipboard.y + 20 }
      const newPlaced = [...placed, newItem]
      setPlaced(newPlaced)
      saveToHistory(newPlaced)
      setSelectedItem(newItem.id)
    }
  }, [clipboard, editingItem, placed, saveToHistory])

  const handleArrowMovement = useCallback(
    (axis: 'x' | 'y', delta: number) => {
      setPlaced(p =>
        p.map(item => {
          if (item.id === selectedItem) return { ...item, [axis]: Math.max(0, item[axis] + delta) }

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
      } else if (itemData.type === 'shape') {
        if (itemData.key === 'text') {
          newItem.content = 'Enter text here'
          newItem.type = 'text'
        } else if (itemData.key === 'dynamic_table') {
          newItem.shapeType = 'dynamic_table'
          newItem.width = DEFAULT_SIZES.dynamic_table.width
          newItem.height = DEFAULT_SIZES.dynamic_table.height
          newItem.tableColumns = ['Description', 'Amount']
          newItem.borderStyle = 'dashed'
          newItem.borderWidth = 2
          newItem.borderColor = '#2196F3'
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
    [placed, saveToHistory, snapToGrid]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

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
        setSelectedItem(newItem.id)
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

  const saveTemplate = useCallback(() => {
    const payload = {
      clientId,
      name: templateName,
      templateType: 'admission_acknowledgement',
      config: {
        canvasBounds: { width: canvasWidth, height: canvasHeight },
        pageSize,
        orientation,
        backgroundImage,
        backgroundOpacity,
        placed
      }
    }
    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => alert('Saved: ' + data.id))
      .catch(console.error)
  }, [
    clientId,
    templateName,
    placed,
    canvasWidth,
    canvasHeight,
    pageSize,
    orientation,
    backgroundImage,
    backgroundOpacity
  ])

  const exportTemplate = useCallback(() => {
    const dataStr = JSON.stringify(
      {
        name: templateName,
        config: {
          canvasBounds: { width: canvasWidth, height: canvasHeight },
          pageSize,
          orientation,
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
  }, [templateName, placed, canvasWidth, canvasHeight, pageSize, orientation, backgroundImage, backgroundOpacity])

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
            if (data.config) {
              if (data.config.pageSize) setPageSize(data.config.pageSize)
              if (data.config.orientation) setOrientation(data.config.orientation)
              if (data.config.backgroundImage !== undefined) setBackgroundImage(data.config.backgroundImage)
              if (data.config.backgroundOpacity !== undefined) setBackgroundOpacity(data.config.backgroundOpacity)
            }
          }
        } catch (error) {
          alert('Invalid template file')
        }
      }
      reader.readAsText(file)
    },
    [saveToHistory]
  )

  const handleDragMovement = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      let newX = e.clientX - rect.left - dragState.offsetX
      let newY = e.clientY - rect.top - dragState.offsetY

      if (snapToGrid) {
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE
      }

      const currentItem = placed.find(p => p.id === dragState.itemId)
      if (!currentItem) return

      // --- ALIGNMENT GUIDE CALCULATIONS ---
      const newGuides: { x?: number; y?: number; type?: string }[] = []
      const itemWidth = currentItem.width || 100
      const itemHeight = currentItem.height || 30

      const canvasCenterX = rect.width / 2
      const canvasCenterY = rect.height / 2
      let itemCenterX = newX + itemWidth / 2
      let itemCenterY = newY + itemHeight / 2

      // 1. Check canvas center snapping
      if (Math.abs(itemCenterX - canvasCenterX) < ALIGNMENT_THRESHOLD) {
        newGuides.push({ x: canvasCenterX, type: 'center' })
        if (Math.abs(itemCenterX - canvasCenterX) < SNAP_THRESHOLD) {
          newX = canvasCenterX - itemWidth / 2
          itemCenterX = newX + itemWidth / 2 // Recalculate after snapping
        }
      }
      if (Math.abs(itemCenterY - canvasCenterY) < ALIGNMENT_THRESHOLD) {
        newGuides.push({ y: canvasCenterY, type: 'center' })
        if (Math.abs(itemCenterY - canvasCenterY) < SNAP_THRESHOLD) {
          newY = canvasCenterY - itemHeight / 2
          itemCenterY = newY + itemHeight / 2 // Recalculate after snapping
        }
      }

      // 2. Check element-to-element snapping (Left, Right, Top, Bottom, and Center)
      placed.forEach(otherItem => {
        if (otherItem.id === dragState.itemId) return

        const otherWidth = otherItem.width || 100
        const otherHeight = otherItem.height || 30
        const otherCenterX = otherItem.x + otherWidth / 2
        const otherCenterY = otherItem.y + otherHeight / 2

        // Define all the points we want to check for alignment
        const alignments = [
          { pos: newX, ref: otherItem.x, axis: 'x' as const }, // Left to Left
          { pos: newX + itemWidth, ref: otherItem.x + otherWidth, axis: 'x' as const }, // Right to Right
          { pos: itemCenterX, ref: otherCenterX, axis: 'x' as const }, // Center X to Center X
          { pos: newY, ref: otherItem.y, axis: 'y' as const }, // Top to Top
          { pos: newY + itemHeight, ref: otherItem.y + otherHeight, axis: 'y' as const }, // Bottom to Bottom
          { pos: itemCenterY, ref: otherCenterY, axis: 'y' as const } // Center Y to Center Y
        ]

        // Loop through all points and check if they are close enough to snap
        alignments.forEach(({ pos, ref, axis }) => {
          const diff = Math.abs(pos - ref)

          if (diff < ALIGNMENT_THRESHOLD) {
            newGuides.push({ [axis]: ref, type: 'align' }) // Draw the blue line

            // If it's really close, snap the position!
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

      // ----------------------------------

      setPlaced(p =>
        p.map(item => {
          if (item.id === dragState.itemId) {
            const maxX = rect.width - (item.width || 100)
            const maxY = rect.height - (item.height || 30)

            return { ...item, x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) }
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
      if (dragState.isDragging && dragState.itemId) handleDragMovement(e)
      else if (resizeState.isResizing && resizeState.itemId) handleResizeMovement(e)
    },
    [dragState, resizeState, handleDragMovement, handleResizeMovement]
  )

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging || resizeState.isResizing) saveToHistory(placed)
    setDragState({ isDragging: false, itemId: null, startX: 0, startY: 0, offsetX: 0, offsetY: 0 })
    setResizeState({
      isResizing: false,
      itemId: null,
      handle: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0
    })

    // Hide guides when dragging stops
    setGuides([])
  }, [dragState.isDragging, resizeState.isResizing, placed, saveToHistory])

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
  }, [selectedItem, editingItem, handleCopy, handlePaste, handleArrowMovement, undo, redo])

  const updateTextContent = useCallback((id: string, content: string) => {
    setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
  }, [])
  const updateItemProperty = useCallback((id: string, property: keyof PlacedField, value: any) => {
    setPlaced(p => p.map(item => (item.id === id ? { ...item, [property]: value } : item)))
  }, [])
  const deleteItem = useCallback(
    (id: string) => {
      const newPlaced = placed.filter(item => item.id !== id)
      setPlaced(newPlaced)
      saveToHistory(newPlaced)
      if (selectedItem === id) setSelectedItem(null)
    },
    [selectedItem, placed, saveToHistory]
  )

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

  const renderShape = useCallback((p: PlacedField, borderStyle: string) => {
    if (p.shapeType === 'rectangle') return <div style={{ width: p.width, height: p.height, border: borderStyle }} />
    if (p.shapeType === 'circle')
      return <div style={{ width: p.width, height: p.height, border: borderStyle, borderRadius: '50%' }} />
    if (p.shapeType === 'line')
      return <div style={{ width: p.width, height: p.height, background: p.borderColor || '#333' }} />
    if (p.shapeType === 'dynamic_table') {
      return (
        <div
          style={{
            width: p.width,
            height: p.height,
            border: borderStyle,
            backgroundColor: 'rgba(33, 150, 243, 0.05)',
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
            {p.tableColumns?.map((col, i) => (
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

  const getItemContent = useCallback(
    (p: PlacedField) => {
      if (p.type === 'field')
        return <span style={{ textAlign: p.textAlign || 'left' }}>{'{{ dynamic.' + p.fieldKey + ' }}'}</span>
      if (p.type === 'text') return <span style={{ textAlign: p.textAlign || 'left' }}>{p.content || 'Text'}</span>
      if (p.type === 'shape') {
        const borderStyle = p.borderWidth
          ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#333'}`
          : '2px solid #333'

        return renderShape(p, borderStyle)
      }
      if (p.type === 'image')
        return <img src={p.imageUrl} alt='Placed' style={{ width: p.width, height: p.height, objectFit: 'contain' }} />

      return null
    },
    [renderShape]
  )

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, position: 'relative' }}>
      {/* Left Sidebar */}
      <div
        style={{
          width: showSidebar ? 260 : 60,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          paddingRight: 10
        }}
      >
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
        >
          {showSidebar ? '◀' : '▶'}
        </button>

        {showSidebar && (
          <>
            <h3 style={{ marginTop: 0 }}>Elements</h3>
            <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4 }}>Fields</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {availableItems
                .filter(f => f.type === 'field')
                .map(f => (
                  <div
                    key={f.key}
                    draggable
                    onDragStart={e => handleDragStart(e, f)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      cursor: 'grab',
                      background: '#f9f9f9',
                      borderRadius: 4,
                      fontSize: 12,
                      flex: '1 1 45%'
                    }}
                  >
                    {f.label}
                  </div>
                ))}
            </div>

            <h4
              style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: 16 }}
            >
              Shapes
            </h4>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
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
                      flex: '1 1 40%',
                      borderRadius: 4,
                      minHeight: 50,
                      gap: 4,
                      border: '1px solid #ddd'
                    }}
                  >
                    {f.key === 'text' && <span style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>abc</span>}
                    {f.key === 'rectangle' && <div style={{ width: 20, height: 14, border: '2px solid #333' }} />}
                    {f.key === 'circle' && (
                      <div style={{ width: 18, height: 18, border: '2px solid #333', borderRadius: '50%' }} />
                    )}
                    {f.key === 'line' && <div style={{ width: 24, height: 2, background: '#333' }} />}
                    {f.key === 'dynamic_table' && (
                      <div
                        style={{
                          width: 24,
                          height: 16,
                          border: '2px dashed #2196F3',
                          background: 'rgba(33, 150, 243, 0.1)'
                        }}
                      />
                    )}
                    <span style={{ fontSize: 10, textAlign: 'center' }}>{f.label}</span>
                  </div>
                ))}
            </div>

            <h4
              style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: 16 }}
            >
              Images
            </h4>
            {availableItems
              .filter(f => f.type === 'image')
              .map(f => (
                <div
                  key={f.key}
                  draggable
                  onDragStart={e => handleDragStart(e, f)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    cursor: 'grab',
                    background: '#f9f9f9',
                    borderRadius: 4,
                    fontSize: 12
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
                padding: '6px',
                border: '1px solid #2196F3',
                background: 'white',
                color: '#2196F3',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                marginTop: 8
              }}
            >
              📁 Upload Image
            </button>

            <h4
              style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: 20 }}
            >
              Canvas Settings
            </h4>
            <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 6, border: '1px solid #eee' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  marginBottom: 12,
                  cursor: 'pointer'
                }}
              >
                <input type='checkbox' checked={snapToGrid} onChange={e => setSnapToGrid(e.target.checked)} /> Snap to
                Grid (20px)
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  marginBottom: 16,
                  cursor: 'pointer'
                }}
              >
                <input type='checkbox' checked={showSafeMargins} onChange={e => setShowSafeMargins(e.target.checked)} />{' '}
                Show Print Safe Area
              </label>
              <input
                ref={bgInputRef}
                type='file'
                accept='image/*'
                onChange={handleBackgroundUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => bgInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'white',
                  border: '1px solid #9C27B0',
                  color: '#9C27B0',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                🖼️ Set Background Watermark
              </button>
              {backgroundImage && (
                <div style={{ marginTop: 12, padding: 8, background: 'rgba(156, 39, 176, 0.05)', borderRadius: 4 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 600 }}>
                    Background Opacity ({Math.round(backgroundOpacity * 100)}%)
                  </label>
                  <input
                    type='range'
                    min='0.05'
                    max='1'
                    step='0.05'
                    value={backgroundOpacity}
                    onChange={e => setBackgroundOpacity(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <button
                    onClick={() => setBackgroundImage(null)}
                    style={{
                      marginTop: 4,
                      width: '100%',
                      padding: 4,
                      color: '#f44336',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11
                    }}
                  >
                    Remove Background
                  </button>
                </div>
              )}
            </div>

            <hr style={{ margin: '16px 0', borderTop: '1px solid #ddd' }} />

            <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4 }}>
              Document Setup
            </h4>
            <select
              value={pageSize}
              onChange={e => setPageSize(e.target.value as keyof typeof PAGE_SIZES | 'Custom')}
              style={{
                width: '100%',
                padding: 6,
                marginBottom: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              {Object.entries(PAGE_SIZES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
              <option value='Custom'>Custom Size</option>
            </select>
            {pageSize === 'Custom' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type='number'
                  value={customWidth}
                  onChange={e => setCustomWidth(Number(e.target.value))}
                  style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
                  placeholder='W'
                />
                <input
                  type='number'
                  value={customHeight}
                  onChange={e => setCustomHeight(Number(e.target.value))}
                  style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
                  placeholder='H'
                />
              </div>
            )}
            <select
              value={orientation}
              onChange={e => setOrientation(e.target.value as 'portrait' | 'landscape')}
              style={{
                width: '100%',
                padding: 6,
                marginBottom: 12,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              <option value='portrait'>Portrait</option>
              <option value='landscape'>Landscape</option>
            </select>

            <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4 }}>Actions</h4>
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
              >
                ↷ Redo
              </button>
            </div>

            <input
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                marginBottom: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13
              }}
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
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 8
              }}
            >
              Save Template
            </button>
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
                fontSize: 12,
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
                fontSize: 12
              }}
            >
              📂 Import Template
            </button>
          </>
        )}
      </div>

      {/* Center - Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>
            Canvas (
            {pageSize === 'Custom' ? `Custom (${customWidth} × ${customHeight} px)` : PAGE_SIZES[pageSize].label})
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            onClick={() => setSelectedItem(null)}
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
              backgroundImage: snapToGrid
                ? 'linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)'
                : 'none',
              backgroundSize: snapToGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto'
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
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: backgroundOpacity,
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />
            )}
            {showSafeMargins && (
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
                  style={{ position: 'absolute', top: 2, left: 4, fontSize: 10, color: '#ff5252', fontWeight: 'bold' }}
                >
                  Print Safe Area
                </span>
              </div>
            )}

            {placed
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map(p => (
                <div
                  key={p.id}
                  draggable={false}
                  onMouseDown={e => {
                    e.stopPropagation()
                    setDragState({
                      isDragging: true,
                      itemId: p.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      offsetX: e.clientX - canvasRef.current!.getBoundingClientRect().left - p.x,
                      offsetY: e.clientY - canvasRef.current!.getBoundingClientRect().top - p.y
                    })
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    setSelectedItem(p.id)
                  }}
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
                    zIndex: p.zIndex || 10
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
                          if (e.key === 'Enter') setEditingItem(null)
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
                        zIndex: 100
                      }}
                    >
                      ×
                    </span>
                  )}

                  {hoveredItem === p.id && (p.type === 'shape' || p.type === 'image' || p.type === 'text') && (
                    <>
                      <div
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 'se',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 'sw',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 'ne',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 'nw',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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
                      <div
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 'n',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 's',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 'e',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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
                        onMouseDown={e => {
                          e.stopPropagation()
                          setResizeState({
                            isResizing: true,
                            itemId: p.id,
                            handle: 'w',
                            startX: e.clientX,
                            startY: e.clientY,
                            startWidth: p.width || 100,
                            startHeight: p.height || 100
                          })
                        }}
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

            {/* Alignment Guides Rendering */}
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

      {/* Right Sidebar */}
      {selectedItem && (
        <PropertiesPanel
          item={placed.find(p => p.id === selectedItem)!}
          updateItemProperty={updateItemProperty}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          deleteItem={deleteItem}
        />
      )}
    </div>
  )
}

DesignerPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default DesignerPage
