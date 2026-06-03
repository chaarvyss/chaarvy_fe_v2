export const PAGE_SIZES = {
  A4: { width: 794, height: 1123, label: 'A4 (210 × 297 mm)' },
  A5: { width: 559, height: 794, label: 'A5 (148 × 210 mm)' },
  Letter: { width: 816, height: 1056, label: 'Letter (8.5 × 11 in)' },
  Legal: { width: 816, height: 1344, label: 'Legal (8.5 × 14 in)' },
  A3: { width: 1123, height: 1587, label: 'A3 (297 × 420 mm)' },
  Tabloid: { width: 1056, height: 1632, label: 'Tabloid (11 × 17 in)' }
}

export const ALIGNMENT_THRESHOLD = 5
export const SNAP_THRESHOLD = 3
export const RESIZE_HANDLE_SIZE = 8
export const DELETE_BUTTON_SIZE = 16
export const MIN_SIZE = 20
export const GRID_SIZE = 20

export const DEFAULT_SIZES = {
  rectangle: { width: 120, height: 60 },
  circle: { width: 80, height: 80 },
  line: { width: 100, height: 1 },
  image: { width: 100, height: 100 },
  dynamic_table: { width: 600, height: 200 },
  fontSize: 12
}

export const FONT_FAMILIES = [
  'Arial',
  'Arial Black',
  'Brush Script MT',
  'Comic Sans MS',
  'Courier New',
  'Garamond',
  'Georgia',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Palatino Linotype',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded'
]

export const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: 'lighter', label: 'Lighter' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
  { value: '900', label: '900' }
]

export type Field = { key: string; label: string; type: 'field' | 'text' | 'shape' | 'image' }

export type PlacedField = {
  id: string
  type: 'field' | 'text' | 'shape' | 'image'
  fieldKey?: string
  content?: string
  shapeType?: 'rectangle' | 'circle' | 'line' | 'dynamic_table'
  tableColumns?: string[]
  imageUrl?: string
  x: number
  y: number
  width?: number
  height?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  opacity?: number
  zIndex?: number
  rotation?: number
  borderWidth?: number
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  visible?: boolean
}

export type DragState = {
  isDragging: boolean
  itemId: string | null
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}
export type ResizeState = {
  isResizing: boolean
  itemId: string | null
  handle: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}
