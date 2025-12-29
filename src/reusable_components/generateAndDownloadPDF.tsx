import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { pxToMm, urlToBase64, groupFieldsByPage } from '../utils/helpers'
import { PAGE_SIZES, NAMED_COLORS } from '../utils/constants'

export interface PlacedField {
  id: string
  type: 'text' | 'field' | 'shape' | 'image' | 'table'
  fieldKey?: string
  content?: string
  shapeType?: 'rectangle' | 'circle' | 'line'
  imageUrl?: string
  x: number
  y: number
  width: number
  height: number
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
  rotation?: number
}

// Table field interface extension (optional, for clarity)
export interface TableField extends PlacedField {
  columns: Array<{ header: string; dataKey: string }>
  data: Array<Record<string, any>>
  tableOptions?: Record<string, any>
}

// Table rendering helper
function drawTable(pdf: jsPDF, field: TableField, xMm: number, yMm: number, widthMm: number) {
  // Use autoTable plugin
  autoTable(pdf, {
    startY: yMm,
    margin: { left: xMm, right: xMm },
    tableWidth: widthMm,
    head: [field.columns.map(col => col.header)],
    body: field.data.map(row => field.columns.map(col => row[col.dataKey])),
    ...field.tableOptions
  })
}

function getPageDimensions(template: any) {
  if (!template) return { width: 210, height: 297 }
  const { pageSize, orientation, customWidth, customHeight } = template
  let width, height
  if (pageSize === 'Custom') {
    width = pxToMm(customWidth || 794)
    height = pxToMm(customHeight || 1123)
  } else {
    width = PAGE_SIZES[pageSize]?.width || 210
    height = PAGE_SIZES[pageSize]?.height || 297
  }
  if (orientation === 'landscape') {
    ;[width, height] = [height, width]
  }
  return { width, height }
}

function resolveFieldContent(field: PlacedField, data: Record<string, any>): string {
  if (field.type !== 'text' && field.type !== 'field') return field.content || ''
  let content = field.content || ''
  content = content.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    if (data[key] !== undefined && data[key] !== null) {
      return String(data[key])
    }
    return match
  })
  if (!content && field.fieldKey && data[field.fieldKey] !== undefined) {
    return String(data[field.fieldKey])
  }
  return content
}

function drawText(pdf: jsPDF, text: string, field: PlacedField, xMm: number, yMm: number, widthMm: number) {
  const fontSize = field.fontSize || 14
  pdf.setFontSize(pxToMm(fontSize) * 2.83)
  let fontFamily = 'helvetica'
  let fontStyle = 'normal'
  if (field.fontFamily) {
    const fam = field.fontFamily.toLowerCase()
    if (fam.includes('times')) fontFamily = 'times'
    else if (fam.includes('courier')) fontFamily = 'courier'
    else fontFamily = 'helvetica'
  }
  if (field.fontWeight && String(field.fontWeight).toLowerCase().includes('bold')) {
    fontStyle = 'bold'
  }
  pdf.setFont(fontFamily, fontStyle)
  let color = field.color || '#000000'
  let opacity = 1
  if (color.startsWith('#')) {
    if (color.length === 9) {
      // #RRGGBBAA
      opacity = parseInt(color.slice(7, 9), 16) / 255
      color = color.slice(0, 7)
    }
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    pdf.setTextColor(r, g, b)
    if (typeof (pdf as any).setGState === 'function' && opacity < 1) {
      pdf.setGState(new (pdf as any).GState({ opacity }))
    }
  } else {
    pdf.setTextColor(0, 0, 0)
  }
  let xOffset = xMm
  const align = field.textAlign || 'left'
  if (align === 'center') {
    xOffset = xMm + widthMm / 2
  } else if (align === 'right') {
    xOffset = xMm + widthMm
  }
  pdf.text(text, xOffset, yMm, { align: align as any })
  if (typeof (pdf as any).setGState === 'function' && opacity < 1) {
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
  }
}

function drawShape(pdf: jsPDF, field: PlacedField, xMm: number, yMm: number, widthMm: number, heightMm: number) {
  let color = field.color || '#ffffff'
  // If color is not a valid hex, default to white
  if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    color = '#ffffff'
  }
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  // Opacity adjustments removed for PDF shapes
  if (field.borderWidth && field.borderWidth > 0) {
    pdf.setLineWidth(pxToMm(field.borderWidth))
    const borderColor = field.borderColor || '#000000'
    const br = parseInt(borderColor.slice(1, 3), 16)
    const bg = parseInt(borderColor.slice(3, 5), 16)
    const bb = parseInt(borderColor.slice(5, 7), 16)
    pdf.setDrawColor(br, bg, bb)
  }
  pdf.setFillColor(r, g, b)
  if (field.shapeType === 'rectangle') {
    if (field.borderWidth && field.borderWidth > 0) {
      pdf.rect(xMm, yMm, widthMm, heightMm, 'FD')
    } else {
      pdf.rect(xMm, yMm, widthMm, heightMm, 'F')
    }
  } else if (field.shapeType === 'circle') {
    const radius = Math.min(widthMm, heightMm) / 2
    const centerX = xMm + widthMm / 2
    const centerY = yMm + heightMm / 2
    if (field.borderWidth && field.borderWidth > 0) {
      pdf.circle(centerX, centerY, radius, 'FD')
    } else {
      pdf.circle(centerX, centerY, radius, 'F')
    }
  } else if (field.shapeType === 'line') {
    pdf.setDrawColor(r, g, b)
    pdf.setLineWidth(pxToMm(field.height || 2))
    pdf.line(xMm, yMm, xMm + widthMm, yMm)
  }
  if (field.opacity !== undefined && field.opacity < 100) {
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
  }
}

async function drawImage(pdf: jsPDF, field: PlacedField, xMm: number, yMm: number, widthMm: number, heightMm: number) {
  if (!field.imageUrl) return
  try {
    let imageData = field.imageUrl
    if (!imageData.startsWith('data:image')) {
      imageData = await urlToBase64(field.imageUrl)
    }
    let format: 'PNG' | 'JPEG' | 'WEBP' = 'PNG'
    if (imageData.startsWith('data:image/jpeg') || imageData.startsWith('data:image/jpg')) {
      format = 'JPEG'
    } else if (imageData.startsWith('data:image/webp')) {
      format = 'WEBP'
    } else if (imageData.startsWith('data:image/png')) {
      format = 'PNG'
    } else {
      if (field.imageUrl.endsWith('.jpg') || field.imageUrl.endsWith('.jpeg')) {
        format = 'JPEG'
      } else if (field.imageUrl.endsWith('.webp')) {
        format = 'WEBP'
      } else if (field.imageUrl.endsWith('.png')) {
        format = 'PNG'
      }
    }
    pdf.addImage(imageData, format, xMm, yMm, widthMm, heightMm)
  } catch (error) {
    // fail silently
  }
}

export async function generateAndDownloadPDF(
  template: any,
  data: Record<string, any>,
  filename = 'generated-document.pdf'
) {
  if (!template) throw new Error('No template provided')
  const { width, height } = getPageDimensions(template)
  const pdf = new jsPDF({
    orientation: template.orientation,
    unit: 'mm',
    format: [width, height]
  })
  const fieldsByPage = groupFieldsByPage(template.fields)
  const pageNumbers = Object.keys(fieldsByPage)
    .map(Number)
    .sort((a, b) => a - b)
  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNum = pageNumbers[i]
    const fields = fieldsByPage[pageNum]
    if (i > 0) {
      pdf.addPage([width, height], template.orientation)
    }
    const sortedFields = [...fields].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    for (const field of sortedFields) {
      if (field.visible === false) continue
      const xMm = pxToMm(field.x)
      const yMm = pxToMm(field.y)
      const widthMm = pxToMm(field.width)
      const heightMm = pxToMm(field.height)
      if (field.type === 'text' || field.type === 'field') {
        const content = resolveFieldContent(field, data)
        drawText(pdf, content, field, xMm, yMm, widthMm)
      } else if (field.type === 'shape') {
        drawShape(pdf, field, xMm, yMm, widthMm, heightMm)
      } else if (field.type === 'image') {
        await drawImage(pdf, field, xMm, yMm, widthMm, heightMm)
      } else if (field.type === 'table') {
        drawTable(pdf, field as TableField, xMm, yMm, widthMm)
      }
    }
  }
  pdf.save(filename)
}
