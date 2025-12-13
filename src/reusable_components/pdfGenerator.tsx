import React, { useState, useRef } from 'react'
import jsPDF from 'jspdf'

interface PlacedField {
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

interface Template {
  pageSize: 'A4' | 'A5' | 'Letter' | 'Legal' | 'A3' | 'Tabloid' | 'Custom'
  orientation: 'portrait' | 'landscape'
  customWidth?: number
  customHeight?: number
  fields: PlacedField[]
}

interface PDFGeneratorProps {
  template?: Template
  data?: Record<string, any>
  onTemplateUpload?: (template: Template) => void
  onDataUpload?: (data: Record<string, any>) => void
}

const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  A3: { width: 297, height: 420 },
  Tabloid: { width: 279.4, height: 431.8 }
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  template: initialTemplate,
  data: initialData,
  onTemplateUpload,
  onDataUpload
}) => {
  const [template, setTemplate] = useState<Template | null>(initialTemplate || null)
  const [data, setData] = useState<Record<string, any>>(initialData || {})
  const [previewMode, setPreviewMode] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const templateInputRef = useRef<HTMLInputElement>(null)
  const dataInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Convert template pixels to PDF mm (assuming 96 DPI, 1mm = 3.78px)
  const pxToMm = (px: number) => px / 3.78

  // Get page dimensions in mm
  const getPageDimensions = () => {
    if (!template) return { width: 210, height: 297 }

    const { pageSize, orientation, customWidth, customHeight } = template

    let width, height

    if (pageSize === 'Custom') {
      width = pxToMm(customWidth || 794)
      height = pxToMm(customHeight || 1123)
    } else {
      width = PAGE_SIZES[pageSize].width
      height = PAGE_SIZES[pageSize].height
    }

    if (orientation === 'landscape') {
      ;[width, height] = [height, width]
    }

    return { width, height }
  }

  // Replace field keys with actual data
  const resolveFieldContent = (field: PlacedField): string => {
    // Treat both 'text' and 'field' as dynamic text fields
    if (field.type !== 'text' && field.type !== 'field') return field.content || ''

    if (field.fieldKey && data[field.fieldKey] !== undefined) {
      return String(data[field.fieldKey])
    }

    return field.content || ''
  }

  // Load template JSON
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string)
        setTemplate(json)
        onTemplateUpload?.(json)
      } catch (error) {
        alert('Invalid template JSON file')
      }
    }
    reader.readAsText(file)
  }

  // Load data JSON
  const handleDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string)
        setData(json)
        onDataUpload?.(json)
      } catch (error) {
        alert('Invalid data JSON file')
      }
    }
    reader.readAsText(file)
  }

  // Draw text with proper alignment
  const drawText = (pdf: jsPDF, text: string, field: PlacedField, xMm: number, yMm: number, widthMm: number) => {
    const fontSize = field.fontSize || 14
    pdf.setFontSize(pxToMm(fontSize) * 2.83) // Convert px to pt

    // Font family and weight support (jsPDF built-in fonts only)
    // Supported font families: helvetica, times, courier
    // Supported font styles: normal, bold
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

    // Set text color
    const color = field.color || '#000000'
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    pdf.setTextColor(r, g, b)

    // Set opacity
    if (field.opacity !== undefined && field.opacity < 100) {
      pdf.setGState(new (pdf as any).GState({ opacity: field.opacity / 100 }))
    }

    // Handle text alignment
    const align = field.textAlign || 'left'
    let xOffset = xMm

    if (align === 'center') {
      xOffset = xMm + widthMm / 2
    } else if (align === 'right') {
      xOffset = xMm + widthMm
    }

    pdf.text(text, xOffset, yMm, { align: align as any })

    // Reset opacity
    if (field.opacity !== undefined && field.opacity < 100) {
      pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
    }
  }

  // Draw shape
  const drawShape = (pdf: jsPDF, field: PlacedField, xMm: number, yMm: number, widthMm: number, heightMm: number) => {
    const color = field.color || '#000000'
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    // Set opacity
    if (field.opacity !== undefined && field.opacity < 100) {
      pdf.setGState(new (pdf as any).GState({ opacity: field.opacity / 100 }))
    }

    // Set border
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

    // Reset opacity
    if (field.opacity !== undefined && field.opacity < 100) {
      pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
    }
  }

  const urlToBase64 = (url: string): Promise<string> => {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          alert('Failed to fetch image: ' + url + '\nStatus: ' + response.status)
          throw new Error('Failed to fetch image: ' + url)
        }
        return response.blob()
      })
      .then(
        blob =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              if (typeof reader.result === 'string') resolve(reader.result)
              else reject('Failed to convert image to base64')
            }
            reader.onerror = e => {
              alert('Failed to read image as base64. Possible CORS issue.')
              reject(e)
            }
            reader.readAsDataURL(blob)
          })
      )
      .catch(error => {
        alert(
          'Image fetch or conversion failed: ' +
            error.message +
            '\nURL: ' +
            url +
            '\nCheck CORS and network. See console for details.'
        )
        console.error('Image fetch or conversion failed:', error, url)
        throw error
      })
  }

  // Draw image (handles both base64 and normal URLs, detects type)
  const drawImage = async (
    pdf: jsPDF,
    field: PlacedField,
    xMm: number,
    yMm: number,
    widthMm: number,
    heightMm: number
  ) => {
    if (!field.imageUrl) return

    try {
      // Set opacity
      if (field.opacity !== undefined && field.opacity < 100) {
        pdf.setGState(new (pdf as any).GState({ opacity: field.opacity / 100 }))
      }

      let imageData = field.imageUrl
      if (!imageData.startsWith('data:image')) {
        // Fetch and convert to base64
        imageData = await urlToBase64(field.imageUrl)
      }

      // Detect image type
      let format: 'PNG' | 'JPEG' | 'WEBP' = 'PNG'
      if (imageData.startsWith('data:image/jpeg') || imageData.startsWith('data:image/jpg')) {
        format = 'JPEG'
      } else if (imageData.startsWith('data:image/webp')) {
        format = 'WEBP'
      } else if (imageData.startsWith('data:image/png')) {
        format = 'PNG'
      } else {
        // Try to infer from file extension if not a data URL
        if (field.imageUrl.endsWith('.jpg') || field.imageUrl.endsWith('.jpeg')) {
          format = 'JPEG'
        } else if (field.imageUrl.endsWith('.webp')) {
          format = 'WEBP'
        } else if (field.imageUrl.endsWith('.png')) {
          format = 'PNG'
        }
      }

      // Debug logging
      if (!imageData.startsWith('data:image')) {
        console.error('Image data is not a valid data URL:', imageData)
        alert('Image data is not a valid data URL. See console for details.')
      }
      // Try to add image
      try {
        console.log('Attempting to add image to PDF:', {
          format,
          imageDataSample: imageData.slice(0, 100),
          xMm,
          yMm,
          widthMm,
          heightMm
        })
        pdf.addImage(imageData, format, xMm, yMm, widthMm, heightMm)
      } catch (addImageError) {
        console.error('addImage failed:', addImageError, {
          format,
          imageDataSample: imageData.slice(0, 100),
          xMm,
          yMm,
          widthMm,
          heightMm
        })
        alert('Failed to add image to PDF. See console for details.')
      }

      // Reset opacity
      if (field.opacity !== undefined && field.opacity < 100) {
        pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
      }
    } catch (error) {
      console.error('Error adding image to PDF:', error, field)
    }
  }

  // Group fields by page if they have a page property, otherwise all on page 0
  const groupFieldsByPage = (fields: PlacedField[]) => {
    const pages: { [key: number]: PlacedField[] } = { 0: [] }

    fields.forEach(field => {
      const page = (field as any).page || 0
      if (!pages[page]) {
        pages[page] = []
      }
      pages[page].push(field)
    })

    return pages
  }

  // Generate PDF
  const generatePDF = async () => {
    if (!template) {
      alert('Please upload a template first')
      return
    }

    setGenerating(true)

    try {
      const { width, height } = getPageDimensions()
      const pdf = new jsPDF({
        orientation: template.orientation,
        unit: 'mm',
        format: [width, height]
      })

      // Group fields by page
      const fieldsByPage = groupFieldsByPage(template.fields)
      const pageNumbers = Object.keys(fieldsByPage)
        .map(Number)
        .sort((a, b) => a - b)
      setTotalPages(pageNumbers.length)

      // Process each page
      for (let i = 0; i < pageNumbers.length; i++) {
        const pageNum = pageNumbers[i]
        const fields = fieldsByPage[pageNum]

        // Add new page if not first
        if (i > 0) {
          pdf.addPage([width, height], template.orientation)
        }

        // Sort fields by zIndex
        const sortedFields = [...fields].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

        // Draw each field
        for (const field of sortedFields) {
          if (field.visible === false) continue

          const xMm = pxToMm(field.x)
          const yMm = pxToMm(field.y)
          const widthMm = pxToMm(field.width)
          const heightMm = pxToMm(field.height)

          if (field.type === 'text' || field.type === 'field') {
            const content = resolveFieldContent(field)
            drawText(pdf, content, field, xMm, yMm, widthMm)
          } else if (field.type === 'shape') {
            drawShape(pdf, field, xMm, yMm, widthMm, heightMm)
          } else if (field.type === 'image') {
            await drawImage(pdf, field, xMm, yMm, widthMm, heightMm)
          }
        }
      }

      // Download PDF
      pdf.save('generated-document.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF')
    } finally {
      setGenerating(false)
    }
  }

  // Preview rendering
  const renderPreview = () => {
    if (!template || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = getPageDimensions()
    const scale = 3.78 // mm to px
    canvas.width = width * scale
    canvas.height = height * scale

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Get fields for current page
    const fieldsByPage = groupFieldsByPage(template.fields)
    const pageNumbers = Object.keys(fieldsByPage)
      .map(Number)
      .sort((a, b) => a - b)
    const fields = fieldsByPage[pageNumbers[currentPage]] || []

    // Sort by zIndex
    const sortedFields = [...fields].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    // Draw each field
    sortedFields.forEach(field => {
      if (field.visible === false) return

      ctx.save()

      // Apply opacity
      if (field.opacity !== undefined) {
        ctx.globalAlpha = field.opacity / 100
      }

      // Apply rotation
      if (field.rotation) {
        const centerX = field.x + field.width / 2
        const centerY = field.y + field.height / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((field.rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
      }

      if (field.type === 'text' || field.type === 'field') {
        const content = resolveFieldContent(field)
        ctx.font = `${field.fontWeight || 'normal'} ${field.fontSize || 14}px ${field.fontFamily || 'Arial'}`
        ctx.fillStyle = field.color || '#000000'

        const textAlign = field.textAlign || 'left'
        // Canvas only supports left, center, right (not justify)
        ctx.textAlign = (textAlign === 'justify' ? 'left' : textAlign) as CanvasTextAlign

        let xPos = field.x
        if (textAlign === 'center') {
          xPos = field.x + field.width / 2
        } else if (textAlign === 'right') {
          xPos = field.x + field.width
        }

        ctx.fillText(content, xPos, field.y + (field.fontSize || 14))
      } else if (field.type === 'shape') {
        ctx.fillStyle = field.color || '#000000'

        if (field.borderWidth && field.borderWidth > 0) {
          ctx.strokeStyle = field.borderColor || '#000000'
          ctx.lineWidth = field.borderWidth
        }

        if (field.shapeType === 'rectangle') {
          ctx.fillRect(field.x, field.y, field.width, field.height)
          if (field.borderWidth && field.borderWidth > 0) {
            ctx.strokeRect(field.x, field.y, field.width, field.height)
          }
        } else if (field.shapeType === 'circle') {
          const radius = Math.min(field.width, field.height) / 2
          const centerX = field.x + field.width / 2
          const centerY = field.y + field.height / 2
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          ctx.fill()
          if (field.borderWidth && field.borderWidth > 0) {
            ctx.stroke()
          }
        } else if (field.shapeType === 'line') {
          ctx.strokeStyle = field.color || '#000000'
          ctx.lineWidth = field.height || 2
          ctx.beginPath()
          ctx.moveTo(field.x, field.y)
          ctx.lineTo(field.x + field.width, field.y)
          ctx.stroke()
        }
      } else if (field.type === 'image' && field.imageUrl) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, field.x, field.y, field.width, field.height)
        }
        img.src = field.imageUrl
      }

      ctx.restore()
    })
  }

  React.useEffect(() => {
    if (previewMode && template) {
      renderPreview()
    }
  }, [previewMode, template, data, currentPage])

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>PDF Generator</h2>

      {/* Upload Section */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Upload Template JSON</label>
          <input
            ref={templateInputRef}
            type='file'
            accept='.json'
            onChange={handleTemplateUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => templateInputRef.current?.click()}
            style={{
              padding: '12px 24px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {template ? '✓ Template Loaded' : 'Choose Template'}
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Upload Data JSON</label>
          <input
            ref={dataInputRef}
            type='file'
            accept='.json'
            onChange={handleDataUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => dataInputRef.current?.click()}
            style={{
              padding: '12px 24px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {Object.keys(data).length > 0 ? '✓ Data Loaded' : 'Choose Data'}
          </button>
        </div>
      </div>

      {/* Data Preview */}
      {Object.keys(data).length > 0 && (
        <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
          <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>Data Preview:</h3>
          <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 200 }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          disabled={!template}
          style={{
            padding: '12px 24px',
            background: previewMode ? '#FF9800' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: template ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 500,
            opacity: template ? 1 : 0.5
          }}
        >
          {previewMode ? 'Hide Preview' : 'Show Preview'}
        </button>

        <button
          onClick={generatePDF}
          disabled={!template || generating}
          style={{
            padding: '12px 24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: template && !generating ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 500,
            opacity: template && !generating ? 1 : 0.5
          }}
        >
          {generating ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>

      {/* Preview Section */}
      {previewMode && template && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Preview</h3>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === 0 ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === totalPages - 1 ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              border: '2px solid #ddd',
              borderRadius: 6,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 500px)',
              background: '#f9f9f9',
              padding: 24,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                background: 'white'
              }}
            />
          </div>
        </div>
      )}

      {/* Template Info */}
      {template && (
        <div style={{ marginTop: 24, padding: 16, background: '#e3f2fd', borderRadius: 6 }}>
          <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>Template Info:</h3>
          <div style={{ fontSize: 14 }}>
            <p>
              <strong>Page Size:</strong> {template.pageSize}
            </p>
            <p>
              <strong>Orientation:</strong> {template.orientation}
            </p>
            <p>
              <strong>Fields:</strong> {template.fields.length}
            </p>
            <p>
              <strong>Text Fields:</strong> {template.fields.filter(f => f.type === 'text').length}
            </p>
            <p>
              <strong>Shapes:</strong> {template.fields.filter(f => f.type === 'shape').length}
            </p>
            <p>
              <strong>Images:</strong> {template.fields.filter(f => f.type === 'image').length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFGenerator
