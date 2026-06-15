import React, { useRef } from 'react'

import { Box, IconButton } from '@muiElements'
import GetChaarvyIcons from 'src/utils/icons'

import { PAGE_SIZES } from '../designerConstants'

interface LeftSidebarProps {
  showSidebar: boolean
  setShowSidebar: (v: boolean) => void
  pdfTemplates: any[]
  selectedTemplateId?: string
  handleTemplateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  availableItems: Field[]
  templateName: string
  setTemplateName: (v: string) => void
  pageSize: string
  setPageSize: (v: any) => void
  orientation: string
  setOrientation: (v: any) => void
  undo: () => void
  redo: () => void
  totalPages: number
  setTotalPages: (v: number) => void
  saveTemplate: () => void
  exportTemplate: () => void
  importTemplate: (e: React.ChangeEvent<HTMLInputElement>) => void
  snapToGrid: boolean
  setSnapToGrid: (v: boolean) => void
  showSafeMargins: boolean
  setShowSafeMargins: (v: boolean) => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  backgroundImage: string | null
  setBackgroundImage: (v: string | null) => void
  backgroundOpacity: number
  setBackgroundOpacity: (v: number) => void
  handleDragStart: (e: React.DragEvent, item: Field) => void
  customWidth: number
  setCustomWidth: (v: number) => void
  customHeight: number
  setCustomHeight: (v: number) => void
  showBorders: boolean
  setShowBorders: (v: boolean) => void
  historyIndex: number
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  showSidebar,
  setShowSidebar,
  pdfTemplates,
  selectedTemplateId,
  handleTemplateChange,
  availableItems,
  templateName,
  setTemplateName,
  pageSize,
  setPageSize,
  orientation,
  setOrientation,
  undo,
  redo,
  saveTemplate,
  exportTemplate,
  importTemplate,
  snapToGrid,
  setSnapToGrid,
  showSafeMargins,
  setShowSafeMargins,
  showBorders,
  setShowBorders,
  handleImageUpload,
  handleBackgroundUpload,
  backgroundImage,
  setBackgroundImage,
  backgroundOpacity,
  setBackgroundOpacity,
  handleDragStart,
  customWidth,
  setCustomHeight,
  customHeight,
  setCustomWidth,
  totalPages,
  setTotalPages,
  historyIndex
}: LeftSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      style={{
        width: showSidebar ? 260 : 60,
        maxHeight: '95vh',
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
          <h3 style={{ marginTop: 0 }}>Template</h3>
          <select
            value={selectedTemplateId || ''}
            onChange={handleTemplateChange}
            style={{
              width: '100%',
              padding: 8,
              marginBottom: 16,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            <option value=''>+ Create New Template</option>
            {pdfTemplates?.map((t: any) => (
              <option key={t.template_id} value={t.template_id}>
                {t.template_name}
              </option>
            ))}
          </select>
          <hr style={{ margin: '16px 0', borderTop: '1px solid #ddd' }} />

          <h3 style={{ marginTop: 0 }}>Elements</h3>
          <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4 }}>Fields</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {availableItems
              .filter(f => f.type === 'field' || f.type === 'image_field')
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

          <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: 16 }}>
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

          <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: 16 }}>
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

          <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: 20 }}>
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

            {/* --- NEW CHECKBOX FOR HIDING BORDERS --- */}
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
              <input type='checkbox' checked={showBorders} onChange={e => setShowBorders(e.target.checked)} /> Show
              Element Outlines
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

          {/* MULTI-PAGE CONTROLS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              background: '#fff',
              padding: 8,
              border: '1px solid #ddd',
              borderRadius: 4
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500 }}>Total Pages</span>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                size='small'
                onClick={() => setTotalPages(Math.max(1, totalPages - 1))}
                style={{ cursor: 'pointer' }}
              >
                <GetChaarvyIcons iconName='Minus' fontSize='1.25rem' />
              </IconButton>
              <span style={{ fontSize: 13, textAlign: 'center' }}>{totalPages}</span>
              <IconButton size='small' onClick={() => setTotalPages(totalPages + 1)} style={{ cursor: 'pointer' }}>
                <GetChaarvyIcons iconName='Plus' fontSize='1.25rem' />
              </IconButton>
            </Box>
          </div>

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

          {/* RESTORED CUSTOM SIZE INPUTS */}
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
  )
}
