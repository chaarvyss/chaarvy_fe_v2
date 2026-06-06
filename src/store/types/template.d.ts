type Field = { key: string; label: string; type: 'field' | 'shape' | 'image' | 'image_field' }
type PlacedField = {
  id: string
  type: 'field' | 'text' | 'shape' | 'image' | 'image_field'
  fieldKey?: string
  content?: string
  shapeType?: 'rectangle' | 'circle' | 'line' | 'dynamic_table' | string
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
type DragState = {
  isDragging: boolean
  itemId: string | null
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}
type ResizeState = {
  isResizing: boolean
  itemId: string | null
  handle: string | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

type Template = {
  clientId: string
  name: string
  templateType: string
  config: {
    canvasBounds: {
      width: number
      height: number
    }
    pageSize: 'A4' | 'A5' | 'Letter' | 'Legal' | 'A3' | 'Tabloid' | 'Custom'
    orientation: 'portrait' | 'landscape'
    backgroundImage: string | null
    backgroundOpacity: number
  }
  placed: PlacedField[]
}

type PdfTemplate = {
  template_id?: string
  template_name: string
  template_html: Template
  available_fields: Field[]
}
