import React, { useEffect } from 'react'
import { PlacedField } from './types'

interface DesignerCanvasProps {
  placed: PlacedField[]
  selectedItem: string | null
  editingItem: string | null
  dragState: any
  resizeState: any
  guides: any[]
  zoom: number
  canvasWidth: number
  canvasHeight: number
  hoveredItem: string | null
  onItemClick: (e: React.MouseEvent, item: PlacedField) => void
  onItemMouseDown: (e: React.MouseEvent, item: PlacedField) => void
  onResizeMouseDown: (e: React.MouseEvent, item: PlacedField, handle: string) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  setHoveredItem: (id: string | null) => void
  updateTextContent: (id: string, content: string) => void
  setEditingItem: (id: string | null) => void
  deleteItem: (id: string) => void
  renderPlacedItem: (p: PlacedField) => React.ReactNode
  onDrop: (e: React.DragEvent) => void
}

const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
  placed,
  selectedItem,
  editingItem,
  guides,
  zoom,
  canvasWidth,
  canvasHeight,
  hoveredItem,
  onItemClick,
  onItemMouseDown,
  onResizeMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  setHoveredItem,
  updateTextContent,
  setEditingItem,
  deleteItem,
  onDrop
}) => {
  const [colResize, setColResize] = React.useState<{
    tableId: string
    colIdx: number
    startX: number
    startWidth: number
  } | null>(null)

  // Handler for mousedown on resizer
  const handleColResizeMouseDown = (e: React.MouseEvent, tableId: string, colIdx: number, colWidth: number) => {
    e.stopPropagation()
    setColResize({ tableId, colIdx, startX: e.clientX, startWidth: colWidth })
  }

  // Handler for mousemove
  useEffect(() => {
    if (colResize) {
      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - colResize.startX
        const newWidth = Math.max(40, colResize.startWidth + delta)
        // Find the table and update its columns
        const table = placed.find(p => p.id === colResize.tableId)
        if (!table || !table.columns) return
        const newColumns = table.columns.map((col, idx) =>
          idx === colResize.colIdx ? { ...col, width: newWidth } : col
        )
        updateTextContent(`${colResize.tableId}_table_columns`, JSON.stringify(newColumns))
      }
      const handleMouseUp = () => setColResize(null)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [colResize, placed])

  const renderItem = (p: PlacedField) => {
    if (p.type === 'field') {
      return <span style={{ textAlign: p.textAlign || 'left', fontSize: p.fontSize }}>{'{{' + p.fieldKey + '}}'}</span>
    } else if (p.type === 'text') {
      if (editingItem === p.id) {
        return (
          <input
            autoFocus
            value={p.content || ''}
            onChange={e => updateTextContent(p.id, e.target.value)}
            onBlur={() => setEditingItem(null)}
            onKeyDown={e => {
              if (e.key === 'Enter') setEditingItem(null)
            }}
            style={{
              fontSize: p.fontSize,
              width: p.width || 120,
              border: '1px solid #2196F3',
              borderRadius: 4,
              fontFamily: p.fontFamily
            }}
          />
        )
      }
      return (
        <span
          style={{ textAlign: p.textAlign || 'left', fontSize: p.fontSize, cursor: 'pointer' }}
          onDoubleClick={() => setEditingItem(p.id)}
        >
          {p.content || 'Text'}
        </span>
      )
    } else if (p.type === 'shape') {
      const borderStyle = p.borderWidth
        ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#333'}`
        : '2px solid #333'
      if (p.shapeType === 'rectangle') {
        return <div style={{ width: p.width, height: p.height, border: borderStyle }} />
      } else if (p.shapeType === 'circle') {
        return <div style={{ width: p.width, height: p.height, border: borderStyle, borderRadius: '50%' }} />
      } else if (p.shapeType === 'line') {
        return <div style={{ width: p.width, height: p.height, background: p.borderColor || '#333' }} />
      }
    } else if (p.type === 'image') {
      return <img src={p.imageUrl} alt='Placed' style={{ width: p.width, height: p.height, objectFit: 'contain' }} />
    } else if (p.type === 'table') {
      // Store column widths in columns array (col.width)
      const columns = p.columns?.map(col => ({ ...col, width: col?.width || 100 }))
      return (
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {columns?.map((col, idx) => (
                <th
                  key={col.dataKey}
                  style={{
                    border: '1px solid #ccc',
                    padding: 2,
                    position: 'relative',
                    width: col.width
                  }}
                >
                  {editingItem === `${p.id}_col_${idx}` ? (
                    <input
                      autoFocus
                      value={col.header}
                      onChange={e => {
                        const newColumns = columns.map((c, i) => (i === idx ? { ...c, header: e.target.value } : c))
                        updateTextContent(`${p.id}_table_columns`, JSON.stringify(newColumns))
                      }}
                      onBlur={() => setEditingItem(null)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') setEditingItem(null)
                      }}
                      style={{ width: 80, border: '1px solid #2196F3', borderRadius: 4 }}
                    />
                  ) : (
                    <span style={{ cursor: 'pointer' }} onDoubleClick={() => setEditingItem(`${p.id}_col_${idx}`)}>
                      {col.header}
                    </span>
                  )}
                  {/* Resizer handle */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 6,
                      height: '100%',
                      cursor: 'col-resize',
                      zIndex: 20,
                      background: 'transparent'
                    }}
                    onMouseDown={e => handleColResizeMouseDown(e, p.id, idx, col.width)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(p.data) ? p.data : []).map((row, i) => (
              <tr key={i}>
                {columns?.map((col, idx) => (
                  <td
                    key={col.dataKey}
                    style={{
                      border: '1px solid #eee',
                      padding: 2,
                      width: col.width,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {row[col.dataKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    return null
  }

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        maxHeight: 'calc(90vh - 80px)',
        border: '1px solid #e0e0e0',
        padding: 20,
        background: '#f5f5f5',
        position: 'relative'
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
    >
      <div
        style={{
          position: 'relative',
          width: canvasWidth,
          height: canvasHeight,
          border: '1px solid #ccc',
          background: 'white',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left',
          margin: 'auto'
        }}
      >
        {placed.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.width,
              height: p.height,
              border: selectedItem === p.id ? '2px solid #2196F3' : '1px dashed #ccc',
              background: hoveredItem === p.id ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
              zIndex: p.zIndex || 0,
              cursor: 'grab',
              userSelect: 'none',
              transition: 'all 0.2s ease',
              opacity: p.opacity !== undefined ? p.opacity : 1
            }}
            onClick={e => onItemClick(e, p)}
            onMouseDown={e => onItemMouseDown(e, p)}
            onMouseEnter={() => setHoveredItem(p.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {renderItem(p)}

            {selectedItem === p.id && (
              <>
                {/* Corners */}
                <div
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: -6,
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 'nw-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 'nw')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -6,
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 'ne-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 'ne')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 'se-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 'se')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: -6,
                    bottom: -6,
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 'sw-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 'sw')
                  }}
                />
                {/* Edges */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: -6,
                    transform: 'translateX(-50%)',
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 'n-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 'n')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -6,
                    transform: 'translateX(-50%)',
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 's-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 's')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 'w-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 'w')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 12,
                    height: 12,
                    background: '#2196F3',
                    borderRadius: 6,
                    cursor: 'e-resize',
                    zIndex: 10
                  }}
                  onMouseDown={e => {
                    e.stopPropagation()
                    onResizeMouseDown(e, p, 'e')
                  }}
                />
                {/* Center (move) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 12,
                    height: 12,
                    background: '#4CAF50',
                    borderRadius: 6,
                    cursor: 'move',
                    zIndex: 10,
                    opacity: 0.7
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
                  background: '#2196F3',
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
                  background: '#2196F3',
                  pointerEvents: 'none',
                  zIndex: 1000
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default DesignerCanvas
