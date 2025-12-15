import React from 'react'
import { Field } from './types'

interface SidebarProps {
  availableItems: Field[]
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  handleDragStart: (e: React.DragEvent, item: Field) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  undo: () => void
  redo: () => void
  historyIndex: number
  historyLength: number
  exportTemplate: () => void
  importTemplate: (e: React.ChangeEvent<HTMLInputElement>) => void
  setPageSize: (size: string) => void
  pageSize: string
  PAGE_SIZES: any
  customWidth: number
  setCustomWidth: (w: number) => void
  customHeight: number
  setCustomHeight: (h: number) => void
  orientation: string
  setOrientation: (o: string) => void
  templateName: string
  setTemplateName: (n: string) => void
  saveTemplate: () => void
}

import { PAGE_SIZES, FONT_FAMILIES, FONT_WEIGHTS } from './constants'

const Sidebar: React.FC<SidebarProps> = ({
  availableItems,
  showSidebar,
  setShowSidebar,
  handleDragStart,
  fileInputRef,
  handleImageUpload,
  undo,
  redo,
  historyIndex,
  historyLength,
  exportTemplate,
  importTemplate,
  setPageSize,
  pageSize,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight,
  orientation,
  setOrientation,
  templateName,
  setTemplateName,
  saveTemplate
}) => {
  return (
    <div
      style={{
        width: showSidebar ? 240 : 60,
        maxHeight: '90vh',
        overflowY: 'auto',
        transition: 'width 0.3s',
        position: 'relative',
        background: '#fafbfc',
        borderRight: '1px solid #eee'
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
              disabled={historyIndex >= historyLength - 1}
              style={{
                flex: 1,
                padding: 6,
                background: historyIndex >= historyLength - 1 ? '#e0e0e0' : '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: historyIndex >= historyLength - 1 ? 'not-allowed' : 'pointer',
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
              onChange={e => setPageSize(e.target.value)}
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
              onChange={e => setOrientation(e.target.value)}
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
              cursor: historyIndex >= historyLength - 1 ? 'not-allowed' : 'pointer',
              padding: 8,
              borderRadius: 4,
              background: historyIndex >= historyLength - 1 ? '#e0e0e0' : '#f9f9f9',
              opacity: historyIndex >= historyLength - 1 ? 0.5 : 1
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
  )
}

export default Sidebar
