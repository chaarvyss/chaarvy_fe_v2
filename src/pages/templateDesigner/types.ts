// Types for the template designer

export type TableColumn = { header: string; dataKey: string; width?: number }
export type TableData = Record<string, any>

export type PlacedField = {
  id: string
  type: 'text' | 'field' | 'shape' | 'image' | 'table'
  fieldKey?: string
  content?: string
  shapeType?: 'rectangle' | 'circle' | 'line'
  imageUrl?: string
  x: number
  y: number
  width?: number
  height?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  opacity?: number
  textAlign?: 'left' | 'center' | 'right'
  zIndex?: number
  visible?: boolean
  borderWidth?: number
  borderColor?: string
  borderStyle?: string
  rotation?: number
  columns?: TableColumn[]
  data?: TableData[] | string
  tableOptions?: any
}

export type Field = { key: string; type: string; label: string }
