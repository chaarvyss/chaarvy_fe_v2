import React from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useDesignerState } from './designerHooks'
import DesignerCanvas from './DesignerCanvas'
import Sidebar from './Sidebar'
import PropertiesPanel from './PropertiesPanel'

import { DEFAULT_SIZES, DEFAULT_TABLE_COLUMNS, DEFAULT_TABLE_DATA, PAGE_SIZES } from './constants'
import { Field, PlacedField } from './types'

const AVAILABLE_ITEMS: Field[] = [
  { key: 'name', type: 'field', label: 'Name' },
  { key: 'email', type: 'field', label: 'Email' },
  { key: 'text', type: 'shape', label: 'Text' },
  { key: 'rectangle', type: 'shape', label: 'Rectangle' },
  { key: 'circle', type: 'shape', label: 'Circle' },
  { key: 'line', type: 'shape', label: 'Line' },
  { key: 'image', type: 'image', label: 'Image' },
  { key: 'table', type: 'table', label: 'Table' }
]

const DesignerPage = () => {
  const designer = useDesignerState()
  // Keyboard arrow key support for moving selected item
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!designer.selectedItem) return
      let dx = 0,
        dy = 0
      const step = e.shiftKey ? 10 : 1
      switch (e.key) {
        case 'ArrowLeft':
          dx = -step
          break
        case 'ArrowRight':
          dx = step
          break
        case 'ArrowUp':
          dy = -step
          break
        case 'ArrowDown':
          dy = step
          break
        default:
          return
      }
      e.preventDefault()
      designer.setPlaced(p =>
        p.map(item =>
          item.id === designer.selectedItem ? { ...item, x: (item.x || 0) + dx, y: (item.y || 0) + dy } : item
        )
      )
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [designer.selectedItem])
  const [showSidebar, setShowSidebar] = React.useState(true)

  // Handlers
  const handleDragStart = (e: React.DragEvent, item: Field) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const itemData = JSON.parse(e.dataTransfer.getData('application/json'))
    const rect = designer.canvasRef.current?.getBoundingClientRect()
    const x = rect ? e.clientX - rect.left : 100
    const y = rect ? e.clientY - rect.top : 100
    const newItem: PlacedField = {
      id: `${itemData.type}_${Date.now()}`,
      type: itemData.type,
      x,
      y,
      fontSize: DEFAULT_SIZES.fontSize,
      visible: true,
      zIndex: designer.placed.length,
      opacity: 1,
      rotation: 0
    }
    if (itemData.type === 'field') {
      newItem.fieldKey = itemData.key
    } else if (itemData.type === 'shape') {
      if (itemData.key === 'text') {
        newItem.content = 'Enter text here'
        newItem.type = 'text'
      } else {
        newItem.shapeType = itemData.key
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
    } else if (itemData.type === 'table') {
      newItem.columns = DEFAULT_TABLE_COLUMNS
      newItem.data = DEFAULT_TABLE_DATA
      newItem.width = 300
      newItem.height = 100
    }
    const newPlaced = [...designer.placed, newItem]
    designer.setPlaced(newPlaced)
    // Optionally: update history
  }

  // Move/resize handlers
  const handleItemMouseDown = (e: React.MouseEvent, item: PlacedField) => {
    e.stopPropagation()
    const rect = designer.canvasRef.current?.getBoundingClientRect()
    const clickX = e.clientX - (rect ? rect.left : 0)
    const clickY = e.clientY - (rect ? rect.top : 0)
    designer.setDragState({
      isDragging: true,
      itemId: item.id,
      startX: clickX,
      startY: clickY,
      offsetX: clickX - (item.x || 0),
      offsetY: clickY - (item.y || 0)
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (designer.dragState.isDragging && designer.dragState.itemId) {
      const rect = designer.canvasRef.current?.getBoundingClientRect()
      const moveX = e.clientX - (rect ? rect.left : 0)
      const moveY = e.clientY - (rect ? rect.top : 0)
      designer.setPlaced(p =>
        p.map(item =>
          item.id === designer.dragState.itemId
            ? { ...item, x: moveX - designer.dragState.offsetX, y: moveY - designer.dragState.offsetY }
            : item
        )
      )
    }
  }

  const handleMouseUp = () => {
    if (designer.dragState.isDragging) {
      designer.setDragState({
        isDragging: false,
        itemId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
      })
    }
  }

  // Resize logic
  const handleResizeMouseDown = (e: React.MouseEvent, item: PlacedField, handle: string) => {
    e.stopPropagation()
    const rect = designer.canvasRef.current?.getBoundingClientRect()
    const startX = e.clientX - (rect ? rect.left : 0)
    const startY = e.clientY - (rect ? rect.top : 0)
    designer.setResizeState({
      isResizing: true,
      itemId: item.id,
      handle,
      startX,
      startY,
      startWidth: item.width || 100,
      startHeight: item.height || 100
    })
  }

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (designer.resizeState.isResizing && designer.resizeState.itemId) {
      const rect = designer.canvasRef.current?.getBoundingClientRect()
      const moveX = e.clientX - (rect ? rect.left : 0)
      const moveY = e.clientY - (rect ? rect.top : 0)
      designer.setPlaced(p =>
        p.map(item => {
          if (item.id !== designer.resizeState.itemId) return item
          let { startWidth, startHeight, startX, startY, handle } = designer.resizeState
          let newWidth = startWidth
          let newHeight = startHeight
          let newX = item.x
          let newY = item.y
          switch (handle) {
            case 'se':
              newWidth = Math.max(20, startWidth + (moveX - startX))
              newHeight = Math.max(20, startHeight + (moveY - startY))
              break
            case 'sw':
              newWidth = Math.max(20, startWidth - (moveX - startX))
              newHeight = Math.max(20, startHeight + (moveY - startY))
              newX = item.x + (moveX - startX)
              break
            case 'ne':
              newWidth = Math.max(20, startWidth + (moveX - startX))
              newHeight = Math.max(20, startHeight - (moveY - startY))
              newY = item.y + (moveY - startY)
              break
            case 'nw':
              newWidth = Math.max(20, startWidth - (moveX - startX))
              newHeight = Math.max(20, startHeight - (moveY - startY))
              newX = item.x + (moveX - startX)
              newY = item.y + (moveY - startY)
              break
            case 'n':
              newHeight = Math.max(20, startHeight - (moveY - startY))
              newY = item.y + (moveY - startY)
              break
            case 's':
              newHeight = Math.max(20, startHeight + (moveY - startY))
              break
            case 'e':
              newWidth = Math.max(20, startWidth + (moveX - startX))
              break
            case 'w':
              newWidth = Math.max(20, startWidth - (moveX - startX))
              newX = item.x + (moveX - startX)
              break
          }
          return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
        })
      )
    }
  }

  const handleResizeMouseUp = () => {
    if (designer.resizeState.isResizing) {
      designer.setResizeState({
        isResizing: false,
        itemId: null,
        handle: null,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0
      })
    }
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex' }}
      onMouseMove={e => {
        handleMouseMove(e)
        handleResizeMouseMove(e)
      }}
      onMouseUp={() => {
        handleMouseUp()
        handleResizeMouseUp()
      }}
      onMouseLeave={() => {
        handleMouseUp()
        handleResizeMouseUp()
      }}
    >
      <Sidebar
        availableItems={AVAILABLE_ITEMS}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        handleDragStart={handleDragStart}
        fileInputRef={designer.fileInputRef}
        handleImageUpload={() => {}}
        undo={() => {}}
        redo={() => {}}
        historyIndex={designer.historyIndex}
        historyLength={designer.history.length}
        exportTemplate={() => {}}
        importTemplate={() => {}}
        setPageSize={() => {}}
        pageSize={'A4'}
        PAGE_SIZES={PAGE_SIZES}
        customWidth={designer.canvasWidth}
        setCustomWidth={designer.setCanvasWidth}
        customHeight={designer.canvasHeight}
        setCustomHeight={designer.setCanvasHeight}
        orientation={'portrait'}
        setOrientation={() => {}}
        templateName={designer.templateName}
        setTemplateName={designer.setTemplateName}
        saveTemplate={() => {}}
      />
      <DesignerCanvas
        placed={designer.placed}
        selectedItem={designer.selectedItem}
        editingItem={designer.editingItem}
        dragState={designer.dragState}
        resizeState={designer.resizeState}
        guides={designer.guides}
        zoom={designer.zoom}
        canvasWidth={designer.canvasWidth}
        canvasHeight={designer.canvasHeight}
        hoveredItem={designer.hoveredItem}
        onItemClick={(e, item) => designer.setSelectedItem(item.id)}
        onItemMouseDown={handleItemMouseDown}
        onResizeMouseDown={handleResizeMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        setHoveredItem={designer.setHoveredItem}
        updateTextContent={(id, content) => {
          // For table header editing, id is `${tableId}_table_columns` and content is JSON string
          if (id.endsWith('_table_columns')) {
            const tableId = id.replace('_table_columns', '')
            designer.setPlaced(p =>
              p.map(item => (item.id === tableId ? { ...item, columns: JSON.parse(content) } : item))
            )
          } else {
            designer.setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
          }
        }}
        setEditingItem={designer.setEditingItem}
        deleteItem={() => {}}
        renderPlacedItem={() => null}
        onDrop={handleDrop}
      />
      <PropertiesPanel
        selectedItem={designer.selectedItem}
        placed={designer.placed}
        updateItemProperty={(id, property, value) => {
          designer.setPlaced(p => p.map(item => (item.id === id ? { ...item, [property]: value } : item)))
        }}
        updateTextContent={(id, content) => {
          designer.setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
        }}
        setEditingItem={designer.setEditingItem}
        bringToFront={() => {
          if (!designer.selectedItem) return
          const maxZ = Math.max(...designer.placed.map(item => item.zIndex || 0))
          designer.setPlaced(p =>
            p.map(item => (item.id === designer.selectedItem ? { ...item, zIndex: maxZ + 1 } : item))
          )
        }}
        sendToBack={() => {
          if (!designer.selectedItem) return
          const minZ = Math.min(...designer.placed.map(item => item.zIndex || 0))
          designer.setPlaced(p =>
            p.map(item => (item.id === designer.selectedItem ? { ...item, zIndex: minZ - 1 } : item))
          )
        }}
        deleteItem={id => {
          designer.setPlaced(p => p.filter(item => item.id !== id))
        }}
      />
    </div>
  )
}

DesignerPage.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>

export default DesignerPage
