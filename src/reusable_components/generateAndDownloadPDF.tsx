import jsPDF from 'jspdf'
import { pxToMm, urlToBase64, groupFieldsByPage } from '../utils/helpers'
import { PAGE_SIZES, NAMED_COLORS } from '../utils/constants'

export interface PlacedField {
  id: string
  type: 'text' | 'field' | 'shape' | 'image'
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
  if (field.fieldKey && data[field.fieldKey] !== undefined) {
    return String(data[field.fieldKey])
  }
  return field.content || ''
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
  if (!color.startsWith('#')) {
    const hex = NAMED_COLORS[color.toLowerCase()]
    if (hex) color = hex
  }
  if (!color.startsWith('#') || color.length !== 7) color = '#000000'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  pdf.setTextColor(r, g, b)
  if (field.opacity !== undefined && field.opacity < 100) {
    pdf.setGState(new (pdf as any).GState({ opacity: field.opacity / 100 }))
  }
  const align = field.textAlign || 'left'
  let xOffset = xMm
  if (align === 'center') {
    xOffset = xMm + widthMm / 2
  } else if (align === 'right') {
    xOffset = xMm + widthMm
  }
  pdf.text(text, xOffset, yMm, { align: align as any })
  if (field.opacity !== undefined && field.opacity < 100) {
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
  }
}

function drawShape(pdf: jsPDF, field: PlacedField, xMm: number, yMm: number, widthMm: number, heightMm: number) {
  const color = field.color || '#000000'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  if (field.opacity !== undefined && field.opacity < 100) {
    pdf.setGState(new (pdf as any).GState({ opacity: field.opacity / 100 }))
  }
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
  if (!field.imageUrl) {
    console.warn('No imageUrl provided for field', field)
    return
  }
  try {
    let imageData = field.imageUrl
    if (!imageData.startsWith('data:image')) {
      imageData = await urlToBase64(field.imageUrl)
      console.debug('Converted image URL to base64:', imageData.slice(0, 50) + '...')
    } else {
      console.debug('Using base64 image data directly.')
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

    let finalImageData = imageData
    if (field.opacity !== undefined && field.opacity < 100) {
      console.debug('Processing image for opacity:', field.opacity)
      const img = new window.Image()
      img.crossOrigin = 'Anonymous'
      const imgLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
          console.debug('Image loaded for opacity processing:', field.imageUrl)
          resolve(img)
        }
        img.onerror = e => {
          console.error('Image failed to load for opacity processing:', field.imageUrl, e)
          reject(e)
        }
      })
      img.src = imageData
      try {
        const loadedImg = await imgLoadPromise
        const canvas = document.createElement('canvas')
        canvas.width = loadedImg.width
        canvas.height = loadedImg.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = field.opacity / 100
          ctx.drawImage(loadedImg, 0, 0)
          finalImageData = canvas.toDataURL()
          console.debug('Canvas image processed with opacity.')
        } else {
          console.error('Failed to get 2D context for canvas.')
        }
      } catch (imgErr) {
        console.error('Image load promise failed:', imgErr)
        // fallback: use original imageData
      }
    }
    pdf.addImage(finalImageData, format, xMm, yMm, widthMm, heightMm)
    console.debug('Image added to PDF:', { format, xMm, yMm, widthMm, heightMm })
  } catch (error) {
    console.error('Error in drawImage:', error, field)
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
      }
    }
  }
  pdf.save(filename)
}
