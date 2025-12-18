import React from 'react'
import { PlacedField } from './types'
import Typography from '@mui/material/Typography'

interface PropertiesPanelProps {
  selectedItem: string | null
  placed: PlacedField[]
  updateItemProperty: (id: string, property: keyof PlacedField, value: any) => void
  updateTextContent: (id: string, content: string) => void
  setEditingItem: (id: string | null) => void
  bringToFront: () => void
  sendToBack: () => void
  deleteItem: (id: string) => void
}

import { FONT_FAMILIES, FONT_WEIGHTS } from './constants'
import { Card } from '@muiElements'
import { Button, Grid, TextField } from '@mui/material'

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedItem,
  placed,
  updateItemProperty,
  bringToFront,
  sendToBack,
  deleteItem
}) => {
  const item = placed.find(p => p.id === selectedItem)
  if (!item) return null

  return (
    <Card sx={{ maxHeight: '90vh', overflowY: 'auto', borderLeft: '1px solid #ddd', padding: '20px' }}>
      <Typography variant='h6' style={{ marginTop: 0 }}>
        Properties
      </Typography>

      <div style={{ marginBottom: 16 }}>
        <Typography style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
          Position X
        </Typography>
        <input
          type='number'
          value={Math.round(item.x)}
          onChange={e => updateItemProperty(item.id, 'x', Number(e.target.value))}
          style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
        />
      </div>
      <div style={{ marginBottom: 16, gap: 8 }}>
        <Typography style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
          Position Y
        </Typography>
        <input
          type='number'
          value={Math.round(item.y)}
          onChange={e => updateItemProperty(item.id, 'y', Number(e.target.value))}
          style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
        />
      </div>

      {/* Table Column Editing UI */}
      {item.type === 'table' && (
        <div style={{ gap: 16, marginBottom: 16 }}>
          <Typography variant='body1'>Table Columns</Typography>
          {item.columns && item.columns.length > 0 && (
            <div>
              {item.columns.map((col, idx) => (
                <Grid container key={col.dataKey} spacing={1} alignItems='center' sx={{ mb: 1 }}>
                  {/* Header */}
                  <Grid item xs={5}>
                    <TextField
                      type='text'
                      value={col.header}
                      onChange={e => {
                        const newColumns = item.columns!.map((c, i) =>
                          i === idx ? { ...c, header: e.target.value } : c
                        )
                        updateItemProperty(item.id, 'columns', newColumns)
                      }}
                      fullWidth
                      placeholder='Header'
                      variant='outlined'
                      size='small'
                    />
                  </Grid>

                  {/* Data Key */}
                  <Grid item xs={5}>
                    <TextField
                      type='text'
                      value={col.dataKey}
                      onChange={e => {
                        const newKey = e.target.value.replace(/\s+/g, '_')
                        if (!item.columns!.some((c, i) => i !== idx && c.dataKey === newKey)) {
                          const newColumns = item.columns!.map((c, i) => (i === idx ? { ...c, dataKey: newKey } : c))
                          updateItemProperty(item.id, 'columns', newColumns)
                        }
                      }}
                      placeholder='Data Key'
                      variant='outlined'
                      size='small'
                    />
                  </Grid>

                  {/* Delete */}
                  <Grid item xs={1} textAlign='right'>
                    <Button
                      onClick={() => {
                        const newColumns = item.columns!.filter((_, i) => i !== idx)
                        updateItemProperty(item.id, 'columns', newColumns)
                      }}
                      title='Delete column'
                      variant='contained'
                      color='error'
                      size='small'
                    >
                      ×
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </div>
          )}

          <Button
            onClick={() => {
              const baseKey = `col${(item.columns?.length || 0) + 1}`
              let newKey = baseKey
              let i = 1
              while (item.columns?.some(c => c.dataKey === newKey)) {
                i++
                newKey = `${baseKey}_${i}`
              }

              const newColumns = [
                ...(item.columns || []),
                {
                  header: `Column ${(item.columns?.length || 0) + 1}`,
                  dataKey: newKey
                }
              ]
              updateItemProperty(item.id, 'columns', newColumns)
            }}
            fullWidth
            sx={{ mt: 2 }}
          >
            + Add Column
          </Button>
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
    </Card>
  )
}

export default PropertiesPanel
