import React, { useCallback } from 'react'

import { FONT_FAMILIES, FONT_WEIGHTS } from './designerConstants'

interface PropertiesPanelProps {
  item: PlacedField
  updateItemProperty: (id: string, property: keyof PlacedField, value: any) => void
  bringToFront: () => void
  sendToBack: () => void
  deleteItem: (id: string) => void
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  item,
  updateItemProperty,
  bringToFront,
  sendToBack,
  deleteItem
}) => {
  const renderTextProperties = useCallback(() => {
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
  }, [item, updateItemProperty])

  const renderTableProperties = useCallback(() => {
    if (item.shapeType !== 'dynamic_table') return null

    return (
      <div style={{ marginBottom: 16, padding: '10px 0', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#2196F3' }}>
          Columns Configurator
        </label>
        {item.tableColumns?.map((col, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input
              value={col}
              onChange={e => {
                const newCols = [...(item.tableColumns || [])]
                newCols[i] = e.target.value
                updateItemProperty(item.id, 'tableColumns', newCols)
              }}
              style={{ flex: 1, padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4 }}
            />
            <button
              onClick={() =>
                updateItemProperty(
                  item.id,
                  'tableColumns',
                  item.tableColumns?.filter((_, idx) => idx !== i)
                )
              }
              style={{
                padding: '0 8px',
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => updateItemProperty(item.id, 'tableColumns', [...(item.tableColumns || []), 'New Column'])}
          style={{
            marginTop: 4,
            width: '100%',
            padding: '6px',
            fontSize: 12,
            background: '#e0e0e0',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          + Add Column
        </button>
      </div>
    )
  }, [item, updateItemProperty])

  return (
    <div style={{ width: 280, maxHeight: '90vh', overflowY: 'auto', borderLeft: '1px solid #ddd', paddingLeft: 20 }}>
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

      {renderTableProperties()}
      {renderTextProperties()}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
          Opacity ({((item.opacity ?? 1) * 100).toFixed(0)}%)
        </label>
        <input
          type='range'
          min='0'
          max='1'
          step='0.01'
          value={item.opacity ?? 1}
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
          {item.borderWidth && item.borderWidth > 0 ? (
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
          ) : null}
        </>
      )}

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
}

export default PropertiesPanel
