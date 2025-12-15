// Re-export the modular DesignerPage
export { default } from './templateDesigner/index';
        if (Math.abs(itemCenterX - canvasCenterX) < ALIGNMENT_THRESHOLD) {
          newGuides.push({ x: canvasCenterX, type: 'center' })
          if (Math.abs(itemCenterX - canvasCenterX) < SNAP_THRESHOLD) {
            newX = canvasCenterX - itemWidth / 2
          }
        }

        if (Math.abs(itemCenterY - canvasCenterY) < ALIGNMENT_THRESHOLD) {
          newGuides.push({ y: canvasCenterY, type: 'center' })
          if (Math.abs(itemCenterY - canvasCenterY) < SNAP_THRESHOLD) {
            newY = canvasCenterY - itemHeight / 2
          }
        }

        // Check alignment with other items
        placed.forEach(item => {
          if (item.id === dragState.itemId) return

          const otherWidth = item.width || 100
          const otherHeight = item.height || 30
          const otherCenterX = item.x + otherWidth / 2
          const otherCenterY = item.y + otherHeight / 2

          const alignments = [
            { pos: newX, ref: item.x, axis: 'x', type: 'align' },
            { pos: newX + itemWidth, ref: item.x + otherWidth, axis: 'x', type: 'align' },
            { pos: newY, ref: item.y, axis: 'y', type: 'align' },
            { pos: newY + itemHeight, ref: item.y + otherHeight, axis: 'y', type: 'align' },
            { pos: itemCenterX, ref: otherCenterX, axis: 'x', type: 'align' },
            { pos: itemCenterY, ref: otherCenterY, axis: 'y', type: 'align' }
          ]

          alignments.forEach(({ pos, ref, axis, type }) => {
            const diff = Math.abs(pos - ref)
            if (diff < ALIGNMENT_THRESHOLD) {
              newGuides.push({ [axis]: ref, type })
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
      } else if (resizeState.isResizing && resizeState.itemId) {
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
              if (handle === 'se') {
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth + deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight + deltaY)
              } else if (handle === 'sw') {
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth - deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight + deltaY)
                newX = item.x + (resizeState.startWidth - newWidth)
              } else if (handle === 'ne') {
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth + deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight - deltaY)
                newY = item.y + (resizeState.startHeight - newHeight)
              } else if (handle === 'nw') {
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth - deltaX)
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight - deltaY)
                newX = item.x + (resizeState.startWidth - newWidth)
                newY = item.y + (resizeState.startHeight - newHeight)
              } else if (handle === 'n') {
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight - deltaY)
                newY = item.y + (resizeState.startHeight - newHeight)
              } else if (handle === 's') {
                newHeight = Math.max(MIN_SIZE, resizeState.startHeight + deltaY)
              } else if (handle === 'e') {
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth + deltaX)
              } else if (handle === 'w') {
                newWidth = Math.max(MIN_SIZE, resizeState.startWidth - deltaX)
                newX = item.x + (resizeState.startWidth - newWidth)
              }

              return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
            }

            return item
          })
        )
      }
    },
    [dragState, resizeState, placed]
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
    const templateData = {
      name: templateName,
      pageSize,
      orientation,
      customWidth,
      customHeight,
      fields: placed
    }
    const dataStr = JSON.stringify(templateData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${templateName.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [templateName, placed, pageSize, orientation, customWidth, customHeight])

  // Import template from JSON
  const importTemplate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target?.result as string)
          // Support both new format (fields) and old format (placed)
          const fields = data.fields || data.placed
          if (fields && Array.isArray(fields)) {
            setPlaced(fields)
            saveToHistory(fields)
            if (data.name) setTemplateName(data.name)
            if (data.pageSize) setPageSize(data.pageSize)
            if (data.orientation) setOrientation(data.orientation)
            if (data.customWidth) setCustomWidth(data.customWidth)
            if (data.customHeight) setCustomHeight(data.customHeight)
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

  const renderPlacedItem = (p: PlacedField) => {
    if (p.type === 'field') {
      return <span style={{ textAlign: p.textAlign || 'left' }}>{'{{' + p.fieldKey + '}}'}</span>
    } else if (p.type === 'text') {
      return <span style={{ textAlign: p.textAlign || 'left' }}>{p.content || 'Text'}</span>
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
    }

    return null
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
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
                .filter(f => f.type === 'shape' || f.type === 'table')
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
                      gap: 4,
                      fontWeight: f.type === 'table' ? 500 : undefined
                    }}
                  >
                    {f.key === 'text' && <span style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>abc</span>}
                    {f.key === 'rectangle' && <div style={{ width: 20, height: 14, border: '2px solid #333' }} />}
                    {f.key === 'circle' && (
                      <div style={{ width: 18, height: 18, border: '2px solid #333', borderRadius: '50%' }} />
                    )}
                    {f.key === 'line' && <div style={{ width: 24, height: 2, background: '#333' }} />}
                    {f.type === 'table' && <span style={{ fontSize: 16 }}>📋 Table</span>}
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




              {/* Z-Index Controls */}
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
                        {renderPlacedItem(p)}
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
                        {renderPlacedItem(p)}
                      </span>
                    ) : null}
                    {(p.type === 'shape' || p.type === 'image') && renderPlacedItem(p)}
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
      {selectedItem &&
        (() => {
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


              {/* Table Column Editing UI */}
              {item.type === 'table' && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ margin: '16px 0 8px 0', fontSize: 15 }}>Table Columns</h4>
                  {item.columns && item.columns.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {item.columns.map((col, idx) => (
                        <div key={col.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="text"
                            value={col.header}
                            onChange={e => {
                              const newColumns = item.columns!.map((c, i) => i === idx ? { ...c, header: e.target.value } : c)
                              updateItemProperty(item.id, 'columns', newColumns)
                            }}
                            style={{ flex: 2, padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
                            placeholder="Header"
                          />
                          <input
                            type="text"
                            value={col.dataKey}
                            onChange={e => {
                              // Prevent duplicate dataKeys
                              const newKey = e.target.value.replace(/\s+/g, '_')
                              if (!item.columns!.some((c, i) => i !== idx && c.dataKey === newKey)) {
                                const newColumns = item.columns!.map((c, i) => i === idx ? { ...c, dataKey: newKey } : c)
                                updateItemProperty(item.id, 'columns', newColumns)
                              }
                            }}
                            style={{ flex: 2, padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
                            placeholder="Data Key"
                          />
                          {/* Resize width (optional, for future: store per-column width) */}
                          <button
                            onClick={() => {
                              const newColumns = item.columns!.filter((_, i) => i !== idx)
                              updateItemProperty(item.id, 'columns', newColumns)
                            }}
                            style={{ flex: 0, background: '#f44336', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                            title="Delete column"
                          >
                            ×
                          </button>
                          {idx > 0 && (
                            <button
                              onClick={() => {
                                // Move column left
                                const newColumns = [...item.columns!]
                                const temp = newColumns[idx - 1]
                                newColumns[idx - 1] = newColumns[idx]
                                newColumns[idx] = temp
                                updateItemProperty(item.id, 'columns', newColumns)
                              }}
                              style={{ flex: 0, background: '#eee', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                              title="Move left"
                            >
                              ←
                            </button>
                          )}
                          {idx < item.columns.length - 1 && (
                            <button
                              onClick={() => {
                                // Move column right
                                const newColumns = [...item.columns!]
                                const temp = newColumns[idx + 1]
                                newColumns[idx + 1] = newColumns[idx]
                                newColumns[idx] = temp
                                updateItemProperty(item.id, 'columns', newColumns)
                              }}
                              style={{ flex: 0, background: '#eee', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                              title="Move right"
                            >
                              →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      // Add new column with unique dataKey
                      const baseKey = `col${(item.columns?.length || 0) + 1}`
                      let newKey = baseKey
                      let i = 1
                      while (item.columns?.some(c => c.dataKey === newKey)) {
                        i++
                        newKey = `${baseKey}_${i}`
                      }
                      const newColumns = [...(item.columns || []), { header: `Column ${item.columns ? item.columns.length + 1 : 1}`, dataKey: newKey }]
                      updateItemProperty(item.id, 'columns', newColumns)
                    }}
                    style={{ marginTop: 10, background: '#2196F3', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', width: '100%' }}
                  >
                    + Add Column
                  </button>
                </div>
              )}

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

              {(item.type === 'text' || item.type === 'field') && (
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
              )}

              {/* Opacity Control */}
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

              {/* Rotation Control */}
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

              {/* Border Controls */}
              {(item.type === 'shape' || item.type === 'text' || item.type === 'field') && (
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
                        <label
                          style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}
                        >
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
                        <label
                          style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}
                        >
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
              )}

              {/* Z-Index Controls */}
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
            </div>
          )
        })()}
    </div>
  </div>
)
}

DesignerPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default DesignerPage
