import React, { useRef } from 'react'

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
  historyIndex: number
  historyLength: number
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
}

export const LeftSidebar: React.FC<LeftSidebarProps> = props => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      style={{
        width: props.showSidebar ? 260 : 60,
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        paddingRight: 10
      }}
    >
      <button
        onClick={() => props.setShowSidebar(!props.showSidebar)}
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
        {props.showSidebar ? '◀' : '▶'}
      </button>

      {props.showSidebar && (
        <>
          <h3 style={{ marginTop: 0 }}>Template</h3>
          <select
            value={props.selectedTemplateId || ''}
            onChange={props.handleTemplateChange}
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
            {props.pdfTemplates?.map((t: any) => (
              <option key={t.template_id} value={t.template_id}>
                {t.template_name}
              </option>
            ))}
          </select>
          <hr style={{ margin: '16px 0', borderTop: '1px solid #ddd' }} />

          <h3 style={{ marginTop: 0 }}>Elements</h3>
          <h4 style={{ fontSize: 13, color: '#666', borderBottom: '1px solid #eee', paddingBottom: 4 }}>Fields</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {props.availableItems
              .filter(f => f.type === 'field')
              .map(f => (
                <div
                  key={f.key}
                  draggable
                  onDragStart={e => props.handleDragStart(e, f)}
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
            {props.availableItems
              .filter(f => f.type === 'shape')
              .map(f => (
                <div
                  key={f.key}
                  draggable
                  onDragStart={e => props.handleDragStart(e, f)}
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
          {props.availableItems
            .filter(f => f.type === 'image')
            .map(f => (
              <div
                key={f.key}
                draggable
                onDragStart={e => props.handleDragStart(e, f)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  cursor: 'grab',
                  background: '#f9f9f9',
                  borderRadius: 4,
                  fontSize: 12,
                  marginBottom: 8
                }}
              >
                {f.label}
              </div>
            ))}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={props.handleImageUpload}
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
              fontSize: 12
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
              <input type='checkbox' checked={props.snapToGrid} onChange={e => props.setSnapToGrid(e.target.checked)} />{' '}
              Snap to Grid (20px)
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
              <input
                type='checkbox'
                checked={props.showSafeMargins}
                onChange={e => props.setShowSafeMargins(e.target.checked)}
              />{' '}
              Show Print Safe Area
            </label>
            <input
              ref={bgInputRef}
              type='file'
              accept='image/*'
              onChange={props.handleBackgroundUpload}
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
            {props.backgroundImage && (
              <div style={{ marginTop: 12, padding: 8, background: 'rgba(156, 39, 176, 0.05)', borderRadius: 4 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 600 }}>
                  Background Opacity ({Math.round(props.backgroundOpacity * 100)}%)
                </label>
                <input
                  type='range'
                  min='0.05'
                  max='1'
                  step='0.05'
                  value={props.backgroundOpacity}
                  onChange={e => props.setBackgroundOpacity(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <button
                  onClick={() => props.setBackgroundImage(null)}
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
            value={props.pageSize}
            onChange={e => props.setPageSize(e.target.value as any)}
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
          {props.pageSize === 'Custom' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type='number'
                value={props.customWidth}
                onChange={e => props.setCustomWidth(Number(e.target.value))}
                style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
                placeholder='W'
              />
              <input
                type='number'
                value={props.customHeight}
                onChange={e => props.setCustomHeight(Number(e.target.value))}
                style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
                placeholder='H'
              />
            </div>
          )}
          <select
            value={props.orientation}
            onChange={e => props.setOrientation(e.target.value as any)}
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
              onClick={props.undo}
              disabled={props.historyIndex === 0}
              style={{
                flex: 1,
                padding: 6,
                background: props.historyIndex === 0 ? '#e0e0e0' : '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: props.historyIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: 12
              }}
            >
              ↶ Undo
            </button>
            <button
              onClick={props.redo}
              disabled={props.historyIndex >= props.historyLength - 1}
              style={{
                flex: 1,
                padding: 6,
                background: props.historyIndex >= props.historyLength - 1 ? '#e0e0e0' : '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: props.historyIndex >= props.historyLength - 1 ? 'not-allowed' : 'pointer',
                fontSize: 12
              }}
            >
              ↷ Redo
            </button>
          </div>

          <input
            value={props.templateName}
            onChange={e => props.setTemplateName(e.target.value)}
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
            onClick={props.saveTemplate}
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
            onClick={props.exportTemplate}
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

          <input
            type='file'
            accept='.json'
            onChange={props.importTemplate}
            style={{ display: 'none' }}
            id='import-input'
          />
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
