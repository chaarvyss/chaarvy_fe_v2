import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAddUpdatePdfTemplateMutation, useGetPdfTemplatesQuery } from 'src/store/services/pdfTemplateServices'

import { LeftSidebar } from './components/LeftSidebar'
import {
  PAGE_SIZES,
  DEFAULT_AVAILABLE_ITEMS,
  GRID_SIZE,
  DEFAULT_SIZES,
  ALIGNMENT_THRESHOLD,
  SNAP_THRESHOLD,
  RESIZE_HANDLE_SIZE,
  DELETE_BUTTON_SIZE,
  MIN_SIZE
} from './designerConstants'
import { formatHtmlVariables } from './designerUtils'
import { useTemplateHistory } from './hooks/useTemplateHistory'
import PropertiesPanel from './PropertiesPanel' // Assuming this already exists in your folder

const DesignerPage = () => {
  // FUTURE API CALL (uncomment when ready):
  // const { data: apiAvailableItems } = useGetAvailableItemsQuery();
  // const availableItems = apiAvailableItems || DEFAULT_AVAILABLE_ITEMS;
  const availableItems: Field[] = DEFAULT_AVAILABLE_ITEMS

  const { data: pdfTemplates, refetch } = useGetPdfTemplatesQuery(undefined, { refetchOnMountOrArgChange: 30 })
  const [savePdfTemplate] = useAddUpdatePdfTemplateMutation()
  const { placed, setPlaced, historyIndex, historyLength, saveToHistory, undo, redo, clearHistory } =
    useTemplateHistory()

  const canvasRef = useRef<HTMLDivElement | null>(null)
  const isInitialLoad = useRef(true)

  const [templateName, setTemplateName] = useState('My Template')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
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
  const [editingSpan, setEditingSpan] = useState<{ itemId: string; spanId: string } | null>(null)
  const [clipboard, setClipboard] = useState<PlacedField | null>(null)
  const [guides, setGuides] = useState<{ x?: number; y?: number; type?: string }[]>([])

  const getCanvasDimensions = useCallback(() => {
    const isCustom = pageSize === 'Custom'
    const isPortrait = orientation === 'portrait'
    if (isCustom)
      return { width: isPortrait ? customWidth : customHeight, height: isPortrait ? customHeight : customWidth }
    const sizes = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES]

    return { width: isPortrait ? sizes.width : sizes.height, height: isPortrait ? sizes.height : sizes.width }
  }, [pageSize, orientation, customWidth, customHeight])

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions()

  const handleSetData = useCallback(
    (data: any) => {
      if (!data) return
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
    },
    [setPlaced, saveToHistory]
  )

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
  }, [pdfTemplates, handleSetData])

  const handleCreateNew = () => {
    setSelectedTemplateId(undefined)
    setTemplateName('New Template')
    clearHistory()
    setPageSize('A4')
    setOrientation('portrait')
    setBackgroundImage(null)
    setBackgroundOpacity(0.15)
    setSelectedItem(null)
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
  }, [clipboard, editingItem, placed, saveToHistory, setPlaced])

  const handleArrowMovement = useCallback(
    (axis: 'x' | 'y', delta: number) => {
      setPlaced(p =>
        p.map(item => (item.id === selectedItem ? { ...item, [axis]: Math.max(0, item[axis] + delta) } : item))
      )
    },
    [selectedItem, setPlaced]
  )

  const handleDragStart = (e: React.DragEvent, item: Field) =>
    e.dataTransfer.setData('text/plain', JSON.stringify(item))

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
    [placed, saveToHistory, snapToGrid, setPlaced]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), [])

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

      const newGuides: { x?: number; y?: number; type?: string }[] = []
      const itemWidth = currentItem.width || 100
      const itemHeight = currentItem.height || 30

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
        if (otherItem.id === dragState.itemId) return
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
    [dragState, placed, snapToGrid, setPlaced]
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
    [resizeState, snapToGrid, setPlaced]
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
  }, [selectedItem, editingItem, handleCopy, handlePaste, handleArrowMovement, undo, redo, deleteItem])

  const updateTextContent = useCallback(
    (id: string, content: string) => {
      setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
    },
    [setPlaced]
  )

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

  const updateItemProperty = useCallback(
    (id: string, property: keyof PlacedField, value: any) => {
      setPlaced(p => p.map(item => (item.id === id ? { ...item, [property]: value } : item)))
    },
    [setPlaced]
  )

  function deleteItem(id: string) {
    const newPlaced = placed.filter(item => item.id !== id)
    setPlaced(newPlaced)
    saveToHistory(newPlaced)
    if (selectedItem === id) setSelectedItem(null)
  }

  const bringToFront = () => {
    if (selectedItem) updateItemProperty(selectedItem, 'zIndex', Math.max(...placed.map(item => item.zIndex || 0)) + 1)
  }
  const sendToBack = () => {
    if (selectedItem) updateItemProperty(selectedItem, 'zIndex', Math.min(...placed.map(item => item.zIndex || 0)) - 1)
  }

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = event => setBackgroundImage(event.target?.result as string)
    reader.readAsDataURL(file)
  }

  const saveTemplate = async () => {
    const payload = {
      clientId: 'clientId',
      templateType: 'admission_acknowledgement',
      name: templateName,
      config: {
        canvasBounds: { width: canvasWidth, height: canvasHeight },
        pageSize,
        orientation,
        backgroundImage,
        backgroundOpacity
      },
      placed
    }
    savePdfTemplate({ template_id: selectedTemplateId, template_name: templateName, template_html: payload })
      .unwrap()
      .then(() => alert('Template saved successfully!'))
      .catch(e => console.error(e))
  }

  const exportTemplate = () => {
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
  }

  const importTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = event => {
      try {
        handleSetData(JSON.parse(event.target?.result as string))
      } catch (error) {
        alert('Invalid template file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, position: 'relative' }}>
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

      <LeftSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        pdfTemplates={pdfTemplates || []}
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
        historyIndex={historyIndex}
        historyLength={historyLength}
        saveTemplate={saveTemplate}
        exportTemplate={exportTemplate}
        importTemplate={importTemplate}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        showSafeMargins={showSafeMargins}
        setShowSafeMargins={setShowSafeMargins}
        handleImageUpload={handleImageUpload}
        handleBackgroundUpload={handleBackgroundUpload}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        backgroundOpacity={backgroundOpacity}
        setBackgroundOpacity={setBackgroundOpacity}
        handleDragStart={handleDragStart}
        customWidth={customWidth}
        setCustomWidth={setCustomWidth}
        customHeight={customHeight}
        setCustomHeight={setCustomHeight}
      />

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

        <button onClick={() => refetch()}>refetch</button>

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
            onClick={() => {
              setSelectedItem(null)
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

            {[...placed]
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map(p => (
                <div
                  key={p.id}
                  draggable={false}
                  onMouseDown={e => {
                    e.stopPropagation()
                    if (editingItem === p.id) return
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
                  onDoubleClick={e => {
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
                    cursor: editingItem === p.id ? 'text' : 'grab',
                    userSelect: editingItem === p.id ? 'auto' : 'none',
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
                          background: 'white',
                          fontSize: p.fontSize,
                          fontFamily: p.fontFamily,
                          fontWeight: p.fontWeight,
                          color: p.color,
                          letterSpacing: p.letterSpacing,
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
                          width: p.width ? `${p.width}px` : 'max-content',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                          padding: 4
                        }}
                        dangerouslySetInnerHTML={{ __html: p.content || 'Text' }}
                      />
                    ) : p.type !== 'shape' && p.type !== 'image' ? (
                      <span
                        style={{
                          fontFamily: p.fontFamily,
                          fontWeight: p.fontWeight,
                          color: p.color,
                          letterSpacing: p.letterSpacing
                        }}
                      >
                        {p.type === 'field' ? (
                          <span style={{ textAlign: p.textAlign || 'left' }}>{'{{ dynamic.' + p.fieldKey + ' }}'}</span>
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
                            startWidth: p.width || 200,
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
                            startWidth: p.width || 200,
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
                            startWidth: p.width || 200,
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
                            startWidth: p.width || 200,
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
                            startWidth: p.width || 200,
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
                            startWidth: p.width || 200,
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
                            startWidth: p.width || 200,
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
                            startWidth: p.width || 200,
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
