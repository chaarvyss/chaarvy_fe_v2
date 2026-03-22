import { Box, FormControl, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import React, { ChangeEvent, useState } from 'react'

interface AvailableTemplate {
  label: string
  placedFields: PlacedField[]
  availableFields?: Field[]
  values?: Record<string, string>
}

type AvailableTemplates = Record<string, AvailableTemplate>

interface SidebarProps {
  availableItems: Field[]
  placedItems: PlacedField[]
  availableFields: Field[]
  availableTemplates?: AvailableTemplates
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  handleDragStart: (e: React.DragEvent, item: Field) => void
  setPageSize: (size: PageSizeEnum) => void
  handleTemplateSelect: (key: string) => void
  handleUpdateAvailableTemplates: () => void
  handleUpdateAvailableFields: (fields: Field[]) => void
  pageSize: PageSizeEnum
  customWidth: number
  setCustomWidth: (w: number) => void
  customHeight: number
  setCustomHeight: (h: number) => void
  orientation: Orientation
  setOrientation: (o: Orientation) => void
  templateName: string
  setTemplateName: (n: string) => void
  saveTemplate: () => void
  user?: string
  setUser: (u: TemplateUser) => void
}

import { Card } from '@muiElements'
import { InputVariants } from 'src/lib/enums'
import ChaarvyAccordian from 'src/reusable_components/chaarvyAccordian'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import ChaarvyFlex from 'src/reusable_components/ChaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import { generateAndDownloadPDF } from 'src/reusable_components/generateAndDownloadPDF'
import { captilizeFirstLetter } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'

import { PAGE_SIZES } from './constants'
import { Orientation, PageSizeEnum, TemplateUser } from './enums'
import { Field, PlacedField } from './types'

const Sidebar: React.FC<SidebarProps> = ({
  availableItems,
  placedItems,
  availableFields,
  availableTemplates,
  showSidebar,
  setShowSidebar,
  handleDragStart,
  setPageSize,
  handleTemplateSelect,
  handleUpdateAvailableTemplates,
  handleUpdateAvailableFields,
  pageSize,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight,
  orientation,
  setOrientation,
  templateName,
  setTemplateName,
  saveTemplate,
  user,
  setUser
}) => {
  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: 6,
    marginBottom: 12,
    border: '1px solid #ddd',
    borderRadius: 4
  }

  const options = availableTemplates
    ? Object.entries(availableTemplates).map(([key, template]) => ({
        id: key,
        label: template.label,
        onOptionClick: () => {
          handleTemplateSelect(key)
        }
      }))
    : []

  const handleSampleDownloadClick = () => {
    generateAndDownloadPDF({ fields: placedItems }, { name: 'Sample Data' })
  }

  const [selectedField, setSelectedField] = useState<Field>()

  const [showFieldModal, setShowFieldModal] = useState(false)

  const onUpdatingFields = (type: 'add' | 'remove', field?: Field) => {
    console.log({ availableFields, field }, 'availableFields')
    if (!field) return
    let newFields = availableFields

    if (type === 'add') {
      if (availableFields.find(f => f.id === field.id)) {
        newFields = availableFields.map(f => (f.id === field.id ? field : f))
      } else {
        newFields = [...availableFields, field]
      }
    } else {
      newFields = availableFields.filter(f => f.id !== field?.id)
    }
    handleUpdateAvailableFields(newFields)
    setSelectedField(undefined)
    setShowFieldModal(false)
  }

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldKey: 'label' | 'key') => {
    setSelectedField(prev => {
      if (!prev) {
        return {
          key: fieldKey === 'key' ? e.target.value : '',
          label: fieldKey === 'label' ? e.target.value : '',
          type: 'field',
          id: Math.random().toString(36).substring(2, 9)
        }
      }

      return {
        ...prev,
        [fieldKey]: e.target.value,
        ...(prev.id ? {} : { id: Math.random().toString(36).substring(2, 9) })
      }
    })
  }

  return (
    <>
      <div
        style={{
          width: showSidebar ? '' : 60,
          overflowY: 'auto',
          transition: 'width 0.3s',
          padding: 16,
          position: 'relative',
          background: '#fafbfc',
          borderRight: '1px solid #eee'
        }}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
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
          title={showSidebar ? 'Minimize Sidebar' : 'Expand Sidebar'}
        >
          {showSidebar ? '◀' : '▶'}
        </button>
        {showSidebar ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                marginTop: 16
              }}
            >
              <Typography variant='h5' gutterBottom>
                Elements
              </Typography>
              <Tooltip title='Available Templates' placement='left'>
                <DropDownMenu dropDownMenuOptions={options} />
              </Tooltip>
            </div>
            <ChaarvyAccordian
              title='Fields'
              extraButton={
                <IconButton
                  onClick={e => {
                    e.stopPropagation()
                    setShowFieldModal(true)
                  }}
                >
                  <GetChaarvyIcons color='primary' iconName='PlusBox' fontSize='1.25rem' />
                </IconButton>
              }
            >
              {availableFields.map(f => (
                <Card
                  key={f.key}
                  draggable
                  onDragStart={e => handleDragStart(e, f)}
                  style={{
                    padding: 8,
                    border: '1px solid #ddd',
                    marginBottom: 8,
                    cursor: 'grab',
                    background: '#f9f9f9',
                    borderRadius: 4
                  }}
                >
                  <ChaarvyFlex justifyContent='space-between' alignItems='center'>
                    <span>{f.label}</span>
                    <Box>
                      <IconButton
                        onClick={e => {
                          e.stopPropagation()
                          setShowFieldModal(true)
                          setSelectedField(f)
                        }}
                      >
                        <GetChaarvyIcons color='warning' iconName='Pencil' fontSize='1.25rem' />
                      </IconButton>
                      <IconButton
                        onClick={e => {
                          e.stopPropagation()
                          onUpdatingFields('remove', f)
                        }}
                      >
                        <GetChaarvyIcons color='error' iconName='TrashCan' fontSize='1.25rem' />
                      </IconButton>
                    </Box>
                  </ChaarvyFlex>
                </Card>
              ))}
            </ChaarvyAccordian>
            <ChaarvyAccordian title='Shapes'>
              <Card style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                {availableItems.map(f => (
                  <Tooltip placement='top' title={f.label}>
                    <Card
                      key={f.key}
                      draggable
                      onDragStart={e => handleDragStart(e, f)}
                      style={{
                        cursor: 'grab',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        borderRadius: 4,
                        minHeight: 50,
                        gap: 4,
                        fontWeight: f.type === 'table' ? 500 : undefined
                      }}
                    >
                      {f.key === 'text' && <span style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>abc</span>}
                      {f.key === 'rectangle' && <div style={{ width: 20, height: 14, border: '2px solid #333' }} />}
                      {f.key === 'circle' && (
                        <div style={{ width: 18, height: 18, border: '2px solid #333', borderRadius: '50%' }} />
                      )}
                      {f.key === 'line' && <div style={{ width: 24, height: 2, background: '#333' }} />}
                      {f.type === 'table' && <span style={{ fontSize: 16 }}>📋</span>}
                      {f.key === 'image' && <span style={{ fontSize: 16 }}>🖼️</span>}
                    </Card>
                  </Tooltip>
                ))}
              </Card>
            </ChaarvyAccordian>
            <Box sx={{ marginTop: 3 }}>
              <FormControl fullWidth>
                <label style={{ display: 'block', marginBottom: 2, fontSize: 14, fontWeight: 500 }}>User</label>
                <select
                  required
                  value={user}
                  style={user === undefined ? { ...selectStyle, border: '1px solid red' } : { ...selectStyle }}
                  onChange={e => setUser(e.target.value as TemplateUser)}
                >
                  <option value={undefined}>Select User Type</option>
                  {Object.entries(TemplateUser).map(([key, value]) => (
                    <option key={key} value={value}>
                      {captilizeFirstLetter(value)}
                    </option>
                  ))}
                </select>
              </FormControl>
            </Box>

            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            <ChaarvyFlex flexDirection='column' gap='8px' marginBottom={12}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Page Size</label>
              <select
                value={pageSize ?? PAGE_SIZES.A4.label}
                onChange={e => setPageSize(e.target.value as PageSizeEnum)}
                style={selectStyle}
              >
                {Object.entries(PAGE_SIZES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
                <option value='Custom'>Custom Size</option>
              </select>
              {pageSize === 'Custom' && (
                <>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                    Width (px)
                  </label>
                  <input
                    type='number'
                    value={customWidth}
                    onChange={e => setCustomWidth(Number(e.target.value))}
                    style={{ width: '100%', padding: 6, marginBottom: 8, border: '1px solid #ddd', borderRadius: 4 }}
                    min='100'
                  />
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500, color: '#666' }}>
                    Height (px)
                  </label>
                  <input
                    type='number'
                    value={customHeight}
                    onChange={e => setCustomHeight(Number(e.target.value))}
                    style={{ width: '100%', padding: 6, marginBottom: 12, border: '1px solid #ddd', borderRadius: 4 }}
                    min='100'
                  />
                </>
              )}
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Orientation</label>
              <select
                value={orientation ?? Orientation.PORTRAIT}
                onChange={e => setOrientation(e.target.value as Orientation)}
                style={selectStyle}
              >
                <option value='portrait'>Portrait</option>
                <option value='landscape'>Landscape</option>
              </select>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Template Name</label>
              <input value={templateName} onChange={e => setTemplateName(e.target.value)} style={selectStyle} />
            </ChaarvyFlex>
            <ChaarvyFlex>
              <ChaarvyButton onClick={saveTemplate} id='save-template-button' label='Save Template' />
              <ChaarvyButton
                onClick={handleSampleDownloadClick}
                id='download-sample-template-button'
                label='Download Sample Template'
              />
            </ChaarvyFlex>
            <Box sx={{ mt: 2 }}>
              <ChaarvyButton
                onClick={handleUpdateAvailableTemplates}
                id='update-available-templates-button'
                label='Update Available Templates'
              />
            </Box>
          </>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 50 }}
          ></div>
        )}
      </div>
      <ChaarvyModal
        shouldRestrictCloseOnOuterClick
        isOpen={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        title='Add New Field'
      >
        <ChaarvyFlex flexDirection='column' gap='16px'>
          <TextField
            fullWidth
            size='small'
            value={selectedField?.label ?? ''}
            type={InputVariants.STRING}
            label='Field Name'
            onChange={e => handleFieldChange(e, 'label')}
          />
          <TextField
            fullWidth
            size='small'
            value={selectedField?.key ?? ''}
            type={InputVariants.STRING}
            label='Field Name'
            onChange={e => handleFieldChange(e, 'key')}
          />
          <ChaarvyButton onClick={() => onUpdatingFields('add', selectedField)}>Update</ChaarvyButton>
        </ChaarvyFlex>
      </ChaarvyModal>
    </>
  )
}

export default Sidebar
