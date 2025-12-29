import React, { DragEvent, useEffect, useMemo, useState } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useDesignerState } from './designerHooks'
import DesignerCanvas from './DesignerCanvas'
import Sidebar from './Sidebar'
import PropertiesPanel from './PropertiesPanel'

import { AVAILABLE_ITEMS, DEFAULT_SIZES, PAGE_SIZES } from './constants'
import { Field, PlacedField } from './types'
import { FieldType, Orientation } from './enums'
import { Card } from '@muiElements'
import { fileToBase64 } from 'src/utils/helpers'

const DesignerPage = () => {
  // Need to get from api
  const DEFAULT_TABLE_COLUMNS = [
    { header: 'Column 1', dataKey: 'col2' },
    { header: 'Column 2', dataKey: 'col1' }
  ]

  /*
  in the above DEFAULT_TABLE_COLUMNS, 
  header is the display name of the column
  dataKey is the key in the data object for that column
  note: datakey must match with data from api
  */

  // Need to get from api
  const AVAILABLE_FIELDS: Field[] = [
    {
      key: 'name',
      type: 'field',
      label: 'Name'
    },
    {
      key: 'email',
      type: 'field',
      label: 'Email'
    }
  ]

  // TODO: Need to add a provision to see how the data looks like in table
  const DEFAULT_TABLE_DATA = []

  // TODO: NEED TO GET FROM API OR DYNAMIC

  const availableTemplates = {
    admission_v1: {
      label: 'Admission Form Acknowledgement Template',
      placedFields: [
        {
          id: 'shape_1766736931787',
          type: 'text',
          x: 197,
          y: 39,
          fontSize: 32,
          visible: true,
          zIndex: 0,
          opacity: 1,
          rotation: 0,
          content: 'Bhavishya junior college',
          width: 394,
          height: 46,
          fontWeight: 'bolder'
        },
        {
          id: 'shape_1766737212614',
          type: 'text',
          x: 216,
          y: 88,
          fontSize: 16,
          visible: true,
          zIndex: 1,
          opacity: 1,
          rotation: 0,
          content: 'AFFILIATED TO BIEAP, COLLEGE CODE:11095',
          width: 357,
          height: 30
        },
        {
          id: 'shape_1766737297925',
          type: 'text',
          x: 184,
          y: 118,
          fontSize: 16,
          visible: true,
          zIndex: 2,
          opacity: 1,
          rotation: 0,
          content: 'APPANAVEEDU, ELURU ROAD, HANUMAN JUNCTION',
          width: 422,
          height: 34
        },
        {
          id: 'shape_1766737364992',
          type: 'text',
          x: 295,
          y: 167,
          fontSize: 16,
          visible: true,
          zIndex: 3,
          opacity: 1,
          rotation: 0,
          content: 'Application for Admission',
          width: 200,
          height: 27
        },
        {
          id: 'shape_1766737439189',
          type: 'text',
          x: 80,
          y: 239,
          fontSize: 16,
          visible: true,
          zIndex: 4,
          opacity: 1,
          rotation: 0,
          content: '1. Name of the student',
          width: 242,
          height: 21
        },
        {
          id: 'shape_1766737553392',
          type: 'text',
          x: 97,
          y: 255,
          fontSize: 12,
          visible: true,
          zIndex: 5,
          opacity: 1,
          rotation: 0,
          content: '(as per SSC in Block Letters)',
          width: 178,
          height: 19
        },
        {
          id: 'shape_1766737631952',
          type: 'text',
          x: 81,
          y: 286,
          fontSize: 16,
          visible: true,
          zIndex: 6,
          opacity: 1,
          rotation: 0,
          content: '2. Name of the Father',
          width: 242,
          height: 20
        },
        {
          id: 'shape_1766737690211',
          type: 'text',
          x: 81,
          y: 311,
          fontSize: 16,
          visible: true,
          zIndex: 7,
          opacity: 1,
          rotation: 0,
          content: '3. Name of the Mother',
          width: 242,
          height: 24
        },
        {
          id: 'shape_1766737732342',
          type: 'text',
          x: 81,
          y: 340,
          fontSize: 16,
          visible: true,
          zIndex: 8,
          opacity: 1,
          rotation: 0,
          content: '4. Occupation of the parent',
          width: 242
        },
        {
          id: 'shape_1766737831117',
          type: 'text',
          x: 119,
          y: 376,
          fontSize: 16,
          visible: true,
          zIndex: 9,
          opacity: 1,
          rotation: 0,
          content: 'Father '
        },
        {
          id: 'shape_1766737859141',
          type: 'text',
          x: 397,
          y: 376,
          fontSize: 16,
          visible: true,
          zIndex: 10,
          opacity: 1,
          rotation: 0,
          content: 'Mother'
        },
        {
          id: 'shape_1766737880360',
          type: 'text',
          x: 82,
          y: 409,
          fontSize: 16,
          visible: true,
          zIndex: 11,
          opacity: 1,
          rotation: 0,
          content: '5. Gender',
          width: 242
        },
        {
          id: 'shape_1766737930393',
          type: 'text',
          x: 81,
          y: 438,
          fontSize: 16,
          visible: true,
          zIndex: 12,
          opacity: 1,
          rotation: 0,
          content: '6. Date of Birth',
          width: 242
        },
        {
          id: 'shape_1766740938093',
          type: 'text',
          x: 82,
          y: 470,
          fontSize: 16,
          visible: true,
          zIndex: 13,
          opacity: 1,
          rotation: 0,
          content: '7. Nationality : Indian',
          width: 242
        },
        {
          id: 'shape_1766740986673',
          type: 'text',
          x: 397,
          y: 470,
          fontSize: 16,
          visible: true,
          zIndex: 14,
          opacity: 1,
          rotation: 0,
          content: '8. Religion :',
          width: 242
        },
        {
          id: 'shape_1766741071558',
          type: 'text',
          x: 82,
          y: 502,
          fontSize: 16,
          visible: true,
          zIndex: 15,
          opacity: 1,
          rotation: 0,
          content: '9. Community : OC / BC / SC / ST',
          width: 262
        },
        {
          id: 'shape_1766741107127',
          type: 'text',
          x: 397,
          y: 502,
          fontSize: 16,
          visible: true,
          zIndex: 16,
          opacity: 1,
          rotation: 0,
          content: 'Sub Caste :'
        },
        {
          id: 'shape_1766741173823',
          type: 'text',
          x: 82,
          y: 531,
          fontSize: 16,
          visible: true,
          zIndex: 17,
          opacity: 1,
          rotation: 0,
          content: '10. Type of Admission : Jr. Inter / Sr. Inter',
          width: 500
        },
        {
          id: 'shape_1766741278813',
          type: 'text',
          x: 81,
          y: 564,
          fontSize: 16,
          visible: true,
          zIndex: 18,
          opacity: 1,
          rotation: 0,
          content: '11. Student Aadhar number :',
          width: 262,
          height: 23
        },
        {
          id: 'shape_1766741427124',
          type: 'text',
          x: 81,
          y: 592,
          fontSize: 16,
          visible: true,
          zIndex: 19,
          opacity: 1,
          rotation: 0,
          content: '12. Father Aadhar No:',
          width: 262
        },
        {
          id: 'shape_1766741474490',
          type: 'text',
          x: 80,
          y: 618,
          fontSize: 16,
          visible: true,
          zIndex: 20,
          opacity: 1,
          rotation: 0,
          content: '13. Mother Aadhar No :',
          width: 262
        },
        {
          id: 'shape_1766741601233',
          type: 'text',
          x: 82,
          y: 648,
          fontSize: 16,
          visible: true,
          zIndex: 21,
          opacity: 1,
          rotation: 0,
          content: '12. Group :',
          width: 262,
          height: 23
        },
        {
          id: 'shape_1766741817876',
          type: 'text',
          x: 81,
          y: 675,
          fontSize: 16,
          visible: true,
          zIndex: 22,
          opacity: 1,
          rotation: 0,
          content: '13. Medium :',
          width: 262
        },
        {
          id: 'shape_1766741838829',
          type: 'text',
          x: 80,
          y: 704,
          fontSize: 16,
          visible: true,
          zIndex: 23,
          opacity: 1,
          rotation: 0,
          content: '14. Second Landuage :',
          width: 262
        },
        {
          id: 'shape_1766741889677',
          type: 'text',
          x: 80,
          y: 734,
          fontSize: 16,
          visible: true,
          zIndex: 24,
          opacity: 1,
          rotation: 0,
          content: '15. Siblings',
          width: 100
        },
        {
          id: 'table_1766741962320',
          type: 'table',
          x: 129,
          y: 766,
          fontSize: 16,
          visible: true,
          zIndex: 25,
          opacity: 1,
          rotation: 0,
          columns: [
            {
              header: 'Student Name',
              dataKey: 'studentName',
              width: 216
            },
            {
              header: 'Standard',
              dataKey: 'standard',
              width: 160
            },
            {
              header: 'School',
              dataKey: 'school',
              width: 213
            }
          ],
          data: [],
          width: 605,
          height: 47
        },
        {
          id: 'shape_1766742221247',
          type: 'text',
          x: 81,
          y: 887,
          fontSize: 16,
          visible: true,
          zIndex: 26,
          opacity: 1,
          rotation: 0,
          content: '14. Address for Communication:',
          width: 262,
          height: 29
        },
        {
          id: 'shape_1766742312448',
          type: 'shape',
          x: 79,
          y: 916,
          fontSize: 16,
          visible: true,
          zIndex: 27,
          opacity: 1,
          rotation: 0,
          shapeType: 'rectangle',
          borderWidth: 2,
          width: 308,
          height: 92
        },
        {
          id: 'shape_1766742363344',
          type: 'text',
          x: 403,
          y: 888,
          fontSize: 16,
          visible: true,
          zIndex: 28,
          opacity: 1,
          rotation: 0,
          content: 'Phone number :',
          width: 262
        },
        {
          id: 'shape_1766742396276',
          type: 'text',
          x: 403,
          y: 917,
          fontSize: 16,
          visible: true,
          zIndex: 29,
          opacity: 1,
          rotation: 0,
          content: 'Phone number 2:',
          width: 262
        },
        {
          id: 'shape_1766742518110',
          type: 'shape',
          x: 0,
          y: 1028,
          fontSize: 16,
          visible: true,
          zIndex: 30,
          opacity: 1,
          rotation: 0,
          shapeType: 'line',
          width: 791,
          height: 2
        },
        {
          id: 'shape_1766742539058',
          type: 'text',
          x: 44,
          y: 1052,
          fontSize: 16,
          visible: true,
          zIndex: 31,
          opacity: 1,
          rotation: 0,
          content: 'Application No :',
          width: 262
        },
        {
          id: 'shape_1766742600345',
          type: 'text',
          x: 398,
          y: 1054,
          fontSize: 16,
          visible: true,
          zIndex: 32,
          opacity: 1,
          rotation: 0,
          content: 'Application Fee :',
          width: 262
        }
      ] as PlacedField[]
    },
    internship_agreement_v1: {
      label: 'Internship Agreement Template',
      placedFields: []
    },
    invoice_v2: {
      label: 'Invoice Template',
      placedFields: []
    }
  }

  const designer = useDesignerState()

  const FilteredAvailableItems = useMemo(() => {
    if (DEFAULT_TABLE_COLUMNS.length > 0) {
      return [...AVAILABLE_ITEMS, { key: 'table', type: 'table', label: 'Table' }]
    }
    return AVAILABLE_ITEMS
  }, [DEFAULT_TABLE_COLUMNS])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!designer.selectedItem) return
      let dx = 0,
        dy = 0
      const step = e.shiftKey ? 10 : 1
      switch (e.key) {
        case 'ArrowLeft':
          dx = -step
          break
        case 'ArrowRight':
          dx = step
          break
        case 'ArrowUp':
          dy = -step
          break
        case 'ArrowDown':
          dy = step
          break
        default:
          return
      }
      e.preventDefault()
      designer.setPlaced(p =>
        p.map(item =>
          item.id === designer.selectedItem ? { ...item, x: (item.x || 0) + dx, y: (item.y || 0) + dy } : item
        )
      )
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [designer.selectedItem])

  const [showSidebar, setShowSidebar] = useState(true)

  // Handlers
  const handleDragStart = (e: DragEvent, item: Field) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    const itemData = JSON.parse(e.dataTransfer.getData('application/json'))
    const rect = designer.canvasRef.current?.getBoundingClientRect()
    let x = rect ? e.clientX - rect.left : 100
    let y = rect ? e.clientY - rect.top : 100
    // Clamp x and y to be within canvas bounds
    x = Math.max(0, Math.min(x, designer.canvasWidth))
    y = Math.max(0, Math.min(y, designer.canvasHeight))
    const newItem: PlacedField = {
      id: `${itemData.type}_${Date.now()}`,
      type: itemData.type,
      x,
      y,
      fontSize: DEFAULT_SIZES.fontSize,
      visible: true,
      zIndex: designer.placed.length,
      opacity: 1,
      rotation: 0
    }
    if (itemData.type === FieldType.FIELD) {
      newItem.fieldKey = itemData.key
    } else if (itemData.type === FieldType.SHAPE) {
      if (itemData.key === FieldType.TEXT) {
        newItem.content = 'Enter text here'
        newItem.type = FieldType.TEXT
      } else {
        newItem.shapeType = itemData.key
        newItem.color = 'transparent' // Default to no fill
        const sizes = DEFAULT_SIZES[itemData.key as keyof typeof DEFAULT_SIZES]
        if (sizes && typeof sizes === 'object') {
          newItem.width = sizes.width
          newItem.height = sizes.height
          if ('borderWidth' in sizes) {
            newItem.borderWidth = (sizes as { borderWidth: number }).borderWidth
          }
        }
      }
    } else if (itemData.type === FieldType.IMAGE) {
      newItem.imageUrl = '/images/logos/logo.png'
      newItem.width = DEFAULT_SIZES.image.width
      newItem.height = DEFAULT_SIZES.image.height
    } else if (itemData.type === FieldType.TABLE) {
      newItem.columns = DEFAULT_TABLE_COLUMNS
      newItem.data = DEFAULT_TABLE_DATA
      newItem.width = 300
      newItem.height = 100
    }
    const newPlaced = [...designer.placed, newItem]
    designer.setPlaced(newPlaced)
  }

  const handleItemMouseDown = (e: React.MouseEvent, item: PlacedField) => {
    e.stopPropagation()
    const rect = designer.canvasRef.current?.getBoundingClientRect()
    const clickX = e.clientX - (rect ? rect.left : 0)
    const clickY = e.clientY - (rect ? rect.top : 0)
    designer.setDragState({
      isDragging: true,
      itemId: item.id,
      startX: clickX,
      startY: clickY,
      offsetX: clickX - (item.x || 0),
      offsetY: clickY - (item.y || 0)
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (designer.dragState.isDragging && designer.dragState.itemId) {
      const rect = designer.canvasRef.current?.getBoundingClientRect()
      let moveX = e.clientX - (rect ? rect.left : 0)
      let moveY = e.clientY - (rect ? rect.top : 0)
      let newX = moveX - designer.dragState.offsetX
      let newY = moveY - designer.dragState.offsetY
      const draggedItem = designer.placed.find(item => item.id === designer.dragState.itemId)
      const itemWidth = draggedItem?.width || 0
      const itemHeight = draggedItem?.height || 0
      newX = Math.max(0, Math.min(newX, designer.canvasWidth - itemWidth))
      newY = Math.max(0, Math.min(newY, designer.canvasHeight - itemHeight))
      designer.setPlaced(p =>
        p.map(item => (item.id === designer.dragState.itemId ? { ...item, x: newX, y: newY } : item))
      )
    }
  }

  const handleMouseUp = () => {
    if (designer.dragState.isDragging) {
      designer.setDragState({
        isDragging: false,
        itemId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
      })
    }
  }

  // Resize logic
  const handleResizeMouseDown = (e: React.MouseEvent, item: PlacedField, handle: string) => {
    e.stopPropagation()
    const rect = designer.canvasRef.current?.getBoundingClientRect()
    const startX = e.clientX - (rect ? rect.left : 0)
    const startY = e.clientY - (rect ? rect.top : 0)
    designer.setResizeState({
      isResizing: true,
      itemId: item.id,
      handle,
      startX,
      startY,
      startWidth: item.width || 100,
      startHeight: item.height || 100
    })
  }

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (designer.resizeState.isResizing && designer.resizeState.itemId) {
      const rect = designer.canvasRef.current?.getBoundingClientRect()
      const moveX = e.clientX - (rect ? rect.left : 0)
      const moveY = e.clientY - (rect ? rect.top : 0)
      designer.setPlaced(p =>
        p.map(item => {
          if (item.id !== designer.resizeState.itemId) return item
          let { startWidth, startHeight, startX, startY, handle } = designer.resizeState
          let newWidth = startWidth
          let newHeight = startHeight
          let newX = item.x
          let newY = item.y
          switch (handle) {
            case 'se':
              newWidth = Math.max(20, startWidth + (moveX - startX))
              newHeight = Math.max(20, startHeight + (moveY - startY))
              break
            case 'sw':
              newWidth = Math.max(20, startWidth - (moveX - startX))
              newHeight = Math.max(20, startHeight + (moveY - startY))
              newX = item.x + (moveX - startX)
              break
            case 'ne':
              newWidth = Math.max(20, startWidth + (moveX - startX))
              newHeight = Math.max(20, startHeight - (moveY - startY))
              newY = item.y + (moveY - startY)
              break
            case 'nw':
              newWidth = Math.max(20, startWidth - (moveX - startX))
              newHeight = Math.max(20, startHeight - (moveY - startY))
              newX = item.x + (moveX - startX)
              newY = item.y + (moveY - startY)
              break
            case 'n':
              newHeight = Math.max(20, startHeight - (moveY - startY))
              newY = item.y + (moveY - startY)
              break
            case 's':
              newHeight = Math.max(20, startHeight + (moveY - startY))
              break
            case 'e':
              newWidth = Math.max(20, startWidth + (moveX - startX))
              break
            case 'w':
              newWidth = Math.max(20, startWidth - (moveX - startX))
              newX = item.x + (moveX - startX)
              break
          }
          return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
        })
      )
    }
  }

  const handleResizeMouseUp = () => {
    if (designer.resizeState.isResizing) {
      designer.setResizeState({
        isResizing: false,
        itemId: null,
        handle: null,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0
      })
    }
  }

  const handleOrientationChange = (orientation: Orientation) => {
    const isPortrait = orientation === Orientation.PORTRAIT
    const size = PAGE_SIZES[designer.PageSize as keyof typeof PAGE_SIZES] || PAGE_SIZES.A4
    designer.setCanvasWidth(isPortrait ? size.width : size.height)
    designer.setCanvasHeight(isPortrait ? size.height : size.width)
    designer.setOrientation(orientation)
  }

  const handlePageSizeChange = (sizeKey: string) => {
    const size = PAGE_SIZES[sizeKey as keyof typeof PAGE_SIZES] || PAGE_SIZES.A4
    designer.setCanvasWidth(size.width)
    designer.setCanvasHeight(size.height)
    designer.setPageSize(sizeKey)
  }

  const onFileUpload = ({ file, item }: { file: File; item: PlacedField }) => {
    fileToBase64(file)
      .then(base64 => {
        designer.setPlaced(p => p.map(plcItem => (plcItem.id === item.id ? { ...plcItem, imageUrl: base64 } : plcItem)))
      })
      .catch(error => {
        console.error('Error converting file to base64:', error)
      })
  }

  const handleExportTemplate = () => {
    const templateData = {
      templateName: designer.templateName,
      fields: designer.placed
    }
    console.log('Exported Template Data:', {
      data: designer.placed,
      stringifiedResult: JSON.stringify(templateData, null, 2)
    })
  }

  return (
    <Card
      style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}
      onMouseMove={e => {
        handleMouseMove(e)
        handleResizeMouseMove(e)
      }}
      onMouseUp={() => {
        handleMouseUp()
        handleResizeMouseUp()
      }}
      onMouseLeave={() => {
        handleMouseUp()
        handleResizeMouseUp()
      }}
    >
      <Sidebar
        availableItems={FilteredAvailableItems}
        availableFields={AVAILABLE_FIELDS}
        availableTemplates={availableTemplates}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        handleDragStart={handleDragStart}
        historyIndex={designer.historyIndex}
        historyLength={designer.history.length}
        exportTemplate={handleExportTemplate}
        importTemplate={() => {}}
        setPageSize={handlePageSizeChange}
        setPlacedFields={designer.setPlaced}
        placedItems={designer.placed}
        pageSize={designer.PageSize}
        PAGE_SIZES={PAGE_SIZES}
        customWidth={designer.canvasWidth}
        setCustomWidth={designer.setCanvasWidth}
        customHeight={designer.canvasHeight}
        setCustomHeight={designer.setCanvasHeight}
        orientation={designer.orientation}
        setOrientation={handleOrientationChange}
        templateName={designer.templateName}
        setTemplateName={designer.setTemplateName}
        saveTemplate={() => console.log(designer.placed)}
      />
      <DesignerCanvas
        placed={designer.placed}
        selectedItem={designer.selectedItem}
        editingItem={designer.editingItem}
        dragState={designer.dragState}
        resizeState={designer.resizeState}
        guides={designer.guides}
        zoom={designer.zoom}
        canvasWidth={designer.canvasWidth}
        canvasHeight={designer.canvasHeight}
        handleImageUpload={onFileUpload}
        hoveredItem={designer.hoveredItem}
        onItemClick={(e, item) => designer.setSelectedItem(item.id)}
        setSelectedItem={designer.setSelectedItem}
        onItemMouseDown={handleItemMouseDown}
        onResizeMouseDown={handleResizeMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        setHoveredItem={designer.setHoveredItem}
        updateTextContent={(id, content) => {
          if (id.endsWith('_table_columns')) {
            const tableId = id.replace('_table_columns', '')
            designer.setPlaced(p =>
              p.map(item => (item.id === tableId ? { ...item, columns: JSON.parse(content) } : item))
            )
          } else {
            designer.setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
          }
        }}
        setEditingItem={designer.setEditingItem}
        deleteItem={() => {}}
        renderPlacedItem={() => null}
        onDrop={handleDrop}
      />
      <PropertiesPanel
        selectedItem={designer.selectedItem}
        placed={designer.placed}
        updateItemProperty={(id, property, value) => {
          designer.setPlaced(p => p.map(item => (item.id === id ? { ...item, [property]: value } : item)))
        }}
        updateTextContent={(id, content) => {
          designer.setPlaced(p => p.map(item => (item.id === id ? { ...item, content } : item)))
        }}
        setEditingItem={designer.setEditingItem}
        bringToFront={() => {
          if (!designer.selectedItem) return
          const maxZ = Math.max(...designer.placed.map(item => item.zIndex || 0))
          designer.setPlaced(p =>
            p.map(item => (item.id === designer.selectedItem ? { ...item, zIndex: maxZ + 1 } : item))
          )
        }}
        sendToBack={() => {
          if (!designer.selectedItem) return
          const minZ = Math.min(...designer.placed.map(item => item.zIndex || 0))
          designer.setPlaced(p =>
            p.map(item => (item.id === designer.selectedItem ? { ...item, zIndex: minZ - 1 } : item))
          )
        }}
        deleteItem={id => {
          designer.setPlaced(p => p.filter(item => item.id !== id))
        }}
        canvasWidth={designer.canvasWidth}
        canvasHeight={designer.canvasHeight}
      />
    </Card>
  )
}

DesignerPage.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>

export default DesignerPage
