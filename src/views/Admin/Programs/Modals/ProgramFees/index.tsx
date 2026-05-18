'use client'

import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ProgramFeesDetailsProps } from 'src/pages/Admin/programs'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

// import { createColorMap } from './colorMapper'
import HeaderCopy from './HeaderCopy'

ModuleRegistry.registerModules([AllCommunityModule])

const ProgramFeesModal = ({ isOpen, onClose, selectedProgram }: ProgramFeesDetailsProps) => {
  const gridRef = useRef<AgGridReact>(null)

  const [changes, setChanges] = useState<Record<string, any>>({})

  /*****************************************
 HELPERS
******************************************/

  const getField = (segmentId: string, mediumId: string, sectionId: string) =>
    `sg_${segmentId}_mid_${mediumId}_sc_${sectionId}`

  const getFieldKey = (feeTypeId: string, field: string) => `${feeTypeId}_${field}`

  const validateValue = (value: any) => value !== null && value !== undefined && value !== '' && !Number.isNaN(value)

  const updateCell = ({ node, row, sourceField, targetField, copiedChanges }: any) => {
    if (sourceField === targetField || !(targetField in row)) {
      return
    }

    const value = row[sourceField]

    if (!validateValue(value)) {
      return
    }

    // AG Grid tracked update
    node.setDataValue(targetField, value)

    copiedChanges[getFieldKey(row.feeTypeId, targetField)] = {
      value
    }
  }

  const getHeaderProps = (displayName: string, type: string, meta: any) => ({
    displayName,
    type,
    meta,
    onCopy: handleCopy,

    ...(type === 'medium'
      ? {
          copyOptions: mediumMap
            .filter(x => x.medium_id !== meta.mediumId)
            .map(x => ({
              id: x.medium_id,
              label: x.medium_name
            }))
        }
      : {
          copyData: {
            mediumMap
          }
        })
  })

  const cellStyle = (params: any) => {
    const field = params.colDef.field

    const feeTypeId = params.data.feeTypeId

    const originalValue = originalRowDataRef.current[feeTypeId]?.[field]

    const currentValue = params.value

    const changed = String(originalValue ?? '') !== String(currentValue ?? '')

    return {
      textAlign: 'center',

      ...(changed && {
        backgroundColor: '#FFF9C4'
      })
    }
  }

  /*****************************************
 API DATA
******************************************/

  const segmentData = [
    {
      segment_name: 'U.K.G',
      segment_id: 'seg-1',
      sequence: 2,
      color: 'linear-gradient(to bottom,#FFF8E1,#FAE8AD)',
      mediums: [
        {
          medium_id: 'med-1',
          medium_name: 'Telugu',
          sequence: 1,
          color: 'linear-gradient(to bottom,#E8FFE8,#BCFFC2)',
          sections: [
            {
              section_id: 'sec-1',
              section_name: 'A',
              sequence: 1,
              color: 'linear-gradient(to bottom,#FFF0F5,#FFD6E7)'
            },
            {
              section_id: 'sec-2',
              section_name: 'B',
              sequence: 2,
              color: 'linear-gradient(to bottom,#E3F2FD,#BBDEFB)'
            },
            {
              section_id: 'sec-3',
              section_name: 'C',
              sequence: 3,
              color: 'linear-gradient(to bottom, #FAF0FF 0%, #F3E5F5 70%, #E8D3EB 100%)'
            }
          ]
        },
        {
          medium_id: 'med-2',
          medium_name: 'English',
          sequence: 2,
          color: 'linear-gradient(to bottom, #FFF1E6 0%, #FFE6CC 70%, #F7D7B4 100%)',
          sections: [
            {
              section_id: 'sec-1',
              section_name: 'A',
              sequence: 1,
              color: 'linear-gradient(to bottom,#FFF0F5,#FFD6E7)'
            },
            { section_id: 'sec-2', section_name: 'B', sequence: 2, color: 'linear-gradient(to bottom,#E3F2FD,#BBDEFB)' }
          ]
        }
      ]
    },
    {
      segment_name: 'L.K.G',
      segment_id: 'seg-2',
      sequence: 1,
      color: 'linear-gradient(to bottom, #FAF0FF 0%, #F3E5F5 70%, #E8D3EB 100%)',

      mediums: [
        {
          medium_id: 'med-1',
          medium_name: 'Telugu',
          sequence: 1,
          color: 'linear-gradient(to bottom, #EBFFFD 0%, #D6F7F5 70%, #BDEDEB 100%)',

          sections: [
            {
              section_id: 'sec-1',
              section_name: 'A',
              sequence: 1,
              color: 'linear-gradient(to bottom,#FFF0F5,#FFD6E7)'
            },
            { section_id: 'sec-2', section_name: 'B', sequence: 2, color: 'linear-gradient(to bottom,#E3F2FD,#BBDEFB)' }
          ]
        },
        {
          medium_id: 'med-2',
          medium_name: 'English',
          sequence: 2,
          color: 'linear-gradient(to bottom, #EDF7FF 0%, #D6EAF8 70%, #C5DEF2 100%)',
          sections: [
            { section_id: 'sec-1', section_name: 'A', sequence: 1, color: 'linear-gradient(to bottom,#FFF0F5,#FFD6E7)' }
          ]
        }
      ]
    }
  ]
  const feesData = [
    {
      id: 'altha-w',
      program_fees_id: 'pfid-1',
      program_id: 'pid-1',
      segment_id: 'seg-1',
      medium_id: 'med-1',
      section_id: 'sec-1',
      fees_type_id: 'ftid-1',
      fees: 2000
    }
  ]

  const feeTypes = [
    {
      fees_type_id: 'ftid-1',
      fees_type_name: 'Admission Fee'
    },

    {
      fees_type_id: 'ftid-2',
      fees_type_name: 'Tuition Fee'
    }
  ]

  /*****************************************
 LOOKUPS
******************************************/

  const feesLookup = useMemo(() => {
    const map: Record<string, any> = {}

    feesData.forEach(item => {
      const key = `${item.segment_id}` + `_${item.medium_id}` + `_${item.section_id}` + `_${item.fees_type_id}`

      map[key] = item
    })

    return map
  }, [feesData])

  const mediumMap = useMemo(() => {
    const map: Record<string, any> = {}

    ;[...segmentData]
      .sort((a, b) => a.sequence - b.sequence)
      .forEach(segment => {
        segment.mediums
          .sort((a, b) => a.sequence - b.sequence)
          .forEach(medium => {
            if (!map[medium.medium_id]) {
              map[medium.medium_id] = {
                medium_id: medium.medium_id,

                medium_name: medium.medium_name,

                sequence: medium.sequence,

                color: medium.color,

                segments: []
              }
            }

            map[medium.medium_id].segments.push({
              segment_id: segment.segment_id,

              segment_name: segment.segment_name,

              sequence: segment.sequence,

              color: segment.color,

              sections: medium.sections.map(section => ({
                ...section
              }))
            })
          })
      })

    return Object.values(map)

      .sort((a: any, b: any) => a.sequence - b.sequence)
  }, [segmentData])

  /*****************************************
 COPY
******************************************/

  const handleCopy = (data: any) => {
    const api = gridRef.current?.api

    if (!api) return

    const copiedChanges: Record<string, any> = {}

    api.forEachNode(node => {
      const row = node.data

      const copy = (sourceField: string, targetField: string) => {
        updateCell({
          node,
          row,
          sourceField,
          targetField,
          copiedChanges
        })
      }

      /*******************
      MEDIUM
    ********************/

      if (data.type === 'medium') {
        const sourceMedium = data.source.mediumId

        data.targets.forEach((targetMedium: string) => {
          mediumMap.forEach((medium: any) => {
            medium.segments.forEach((segment: any) => {
              segment.sections.forEach((section: any) => {
                copy(
                  getField(segment.segment_id, sourceMedium, section.section_id),

                  getField(segment.segment_id, targetMedium, section.section_id)
                )
              })
            })
          })
        })
      }

      /*******************
      SEGMENT
    ********************/

      if (data.type === 'segment') {
        const { segmentId, mediumId } = data.source

        const { mediums, segments } = data.targets

        Object.keys(row)

          .filter(key => key.startsWith(`sg_${segmentId}_mid_${mediumId}`) && !key.endsWith('_id'))

          .forEach(sourceField => {
            const sectionId = sourceField.split('_sc_')[1]

            mediums.forEach((targetMedium: string) => {
              segments.forEach((targetSegment: string) => {
                if (targetMedium === mediumId && targetSegment === segmentId) {
                  return
                }

                copy(
                  sourceField,

                  getField(targetSegment, targetMedium, sectionId)
                )
              })
            })
          })
      }

      /*******************
      SECTION
    ********************/

      if (data.type === 'section') {
        const { sectionId, segmentId, mediumId } = data.source

        const { mediums, segments, sections } = data.targets

        const sourceField = getField(segmentId, mediumId, sectionId)

        mediums.forEach((targetMedium: string) => {
          segments.forEach((targetSegment: string) => {
            sections.forEach((targetSection: string) => {
              if (targetMedium === mediumId && targetSegment === segmentId && targetSection === sectionId) {
                return
              }

              copy(
                sourceField,

                getField(targetSegment, targetMedium, targetSection)
              )
            })
          })
        })
      }
    })

    setChanges(prev => ({
      ...prev,
      ...copiedChanges
    }))
  }

  /*****************************************
 COLUMN DEFS
******************************************/

  const getHeaderClass = (type: 'medium' | 'segment' | 'section', id: string) => {
    return `${type}-${id}`
  }

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
    return [
      {
        headerName: 'Fee Type',
        field: 'feeType',
        pinned: 'left' as const,
        width: 180,
        editable: false
      },

      ...mediumMap.map(
        (medium: any): ColGroupDef => ({
          headerStyle: {
            background: medium.color,
            textAlign: 'center',
            fontWeight: 600,
            border: '1px solid #ddd'
          },
          headerName: medium.medium_name,
          headerClass: getHeaderClass('medium', medium.medium_id),
          headerGroupComponent: HeaderCopy,
          headerGroupComponentParams: getHeaderProps(medium.medium_name, 'medium', {
            mediumId: medium.medium_id
          }),

          children: medium.segments.map(
            (segment: any): ColGroupDef => ({
              headerStyle: {
                background: segment.color,
                textAlign: 'center',
                fontWeight: 600,
                border: '1px solid #ddd'
              },
              headerName: segment.segment_name,

              headerClass: getHeaderClass('segment', segment.segment_id),

              headerGroupComponent: HeaderCopy,

              headerGroupComponentParams: getHeaderProps(segment.segment_name, 'segment', {
                segmentId: segment.segment_id,

                mediumId: medium.medium_id,
                headerStyle: {
                  background: segment.color
                }
              }),

              children: segment.sections.map(
                (section: any): ColDef => ({
                  headerStyle: {
                    background: section.color,
                    textAlign: 'center',
                    fontWeight: 600,
                    border: '1px solid #ddd'
                  },
                  headerName: section.section_name,

                  headerClass: getHeaderClass('section', section.section_id),

                  headerComponent: HeaderCopy,

                  headerComponentParams: getHeaderProps(section.section_name, 'section', {
                    sectionId: section.section_id,

                    segmentId: segment.segment_id,

                    mediumId: medium.medium_id,
                    headerStyle: {
                      background: section.color
                    }
                  }),

                  field: getField(segment.segment_id, medium.medium_id, section.section_id),

                  editable: true,

                  width: 120,

                  cellStyle
                })
              )
            })
          )
        })
      )
    ]
  }, [mediumMap, changes])

  /*****************************************
 ROW DATA
******************************************/

  const initialRowData = useMemo(() => {
    return feeTypes.map(fee => {
      const row: any = {
        feeType: fee.fees_type_name,
        feeTypeId: fee.fees_type_id
      }

      segmentData.forEach(segment => {
        segment.mediums.forEach(medium => {
          medium.sections.forEach(section => {
            const field = `sg_${segment.segment_id}` + `_mid_${medium.medium_id}` + `_sc_${section.section_id}`

            const existing =
              feesLookup[
                `${segment.segment_id}` + `_${medium.medium_id}` + `_${section.section_id}` + `_${fee.fees_type_id}`
              ]

            row[field] = existing?.fees ?? ''

            row[`${field}_id`] = existing?.program_fees_id
          })
        })
      })

      return row
    })
  }, [feeTypes, segmentData, feesLookup])

  const originalRowDataRef = useRef<Record<string, any>>({})
  useEffect(() => {
    const data: Record<string, any> = {}
    initialRowData.forEach(row => {
      data[row.feeTypeId] = { ...row }
    })
    originalRowDataRef.current = data
  }, [initialRowData])

  const [rowData, setRowData] = useState(initialRowData)

  /*****************************************
 CHANGE
******************************************/

  const onCellValueChanged = (params: CellValueChangedEvent) => {
    const field = params.colDef.field as string

    const feeTypeId = params.data.feeTypeId

    const key = `${feeTypeId}_${field}`

    // track changed cells
    setChanges(prev => ({
      ...prev,

      [key]: {
        value: params.newValue
      }
    }))

    // sync actual row data
    setRowData(prev =>
      prev.map(row => {
        if (row.feeTypeId === feeTypeId) {
          return {
            ...row,

            [field]: params.newValue
          }
        }

        return row
      })
    )
  }

  /*****************************************
 SAVE
******************************************/

  const saveChanges = () => {
    const payload = Object.entries(changes)

      .map(([key, value]: any) => {
        const [feeTypeId, , segmentId, , mediumId, , sectionId] = key.split('_')

        const field = `sg_${segmentId}` + `_mid_${mediumId}` + `_sc_${sectionId}`

        const row = rowData.find(x => x.feeTypeId === feeTypeId)

        return {
          program_fees_id: row?.[`${field}_id`] ?? null,

          program_id: selectedProgram?.program_id,

          segment_id: segmentId,

          medium_id: mediumId,

          section_id: sectionId,

          fees_type_id: feeTypeId,

          fees: value.value
        }
      })

    console.log(payload)
  }

  /*****************************************
 UI
******************************************/

  const [hiddenColumns, setHiddenColumns] = useState<
    {
      id: string
      name: string
      colIds: string[]
    }[]
  >([])

  const syncHiddenColumns = useCallback(() => {
    const columns = gridRef.current?.api.getColumns()

    if (!columns) return

    const hiddenMap = new Map<
      string,
      {
        id: string
        name: string
        colIds: string[]
      }
    >()

    columns
      .filter(col => !col.isVisible())
      .forEach(col => {
        const groups: string[] = []

        let parent = col.getParent()

        while (parent) {
          const header = parent.getColGroupDef()?.headerName

          if (header) {
            groups.unshift(header)
          }

          parent = parent.getParent()
        }

        const colId = col.getColId()

        // Telugu
        // Telugu > LKG
        // Telugu > LKG > A

        for (let level = 1; level <= groups.length + 1; level++) {
          const path = level <= groups.length ? groups.slice(0, level) : [...groups, col.getColDef()?.headerName]

          const key = path.join('__')

          if (!hiddenMap.has(key)) {
            hiddenMap.set(key, {
              id: key,
              name: path.join(' > '),
              colIds: []
            })
          }

          hiddenMap.get(key)!.colIds.push(colId)
        }
      })

    const values = Array.from(hiddenMap.values())

    // remove duplicates
    values.forEach(item => {
      item.colIds = [...new Set(item.colIds)]
    })

    const result = values.filter(item => {
      return !values.some(
        other => other !== item && other.id.startsWith(item.id + '__') && other.colIds.length === item.colIds.length
      )
    })

    setHiddenColumns(result)
  }, [])

  return (
    <ChaarvyModal isOpen={isOpen} onClose={onClose} modalSize='col-11'>
      <>
        <Stack direction='row' spacing={2} mb={2}>
          <Button onClick={() => gridRef.current?.api.undoCellEditing()}>Undo</Button>

          <Button onClick={() => gridRef.current?.api.redoCellEditing()}>Redo</Button>

          <Button color='success' onClick={saveChanges}>
            Save
          </Button>
        </Stack>

        <div
          className='ag-theme-alpine'
          style={{
            height: '70vh'
          }}
        >
          {hiddenColumns.length > 0 && (
            <Box
              display='flex'
              gap={1}
              mb={2}
              flexWrap='wrap'
              sx={{
                p: 1,
                border: '1px solid #eee',
                borderRadius: 2,
                background: '#fafafa'
              }}
            >
              <Typography fontWeight={600}>Hidden:</Typography>

              {hiddenColumns.map(column => (
                <Chip
                  key={column.id}
                  label={column.name}
                  onDelete={() => {
                    gridRef.current?.api?.setColumnsVisible(column?.colIds, true)
                  }}
                />
              ))}
            </Box>
          )}

          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            getRowId={p => String(p.data.feeTypeId)}
            onCellValueChanged={onCellValueChanged}
            defaultColDef={{
              resizable: true,
              sortable: false,
              filter: false
            }}
            undoRedoCellEditing
            undoRedoCellEditingLimit={100}
            onColumnVisible={syncHiddenColumns}
            onColumnMoved={syncHiddenColumns}
            suppressDragLeaveHidesColumns={false}
          />
        </div>
      </>
    </ChaarvyModal>
  )
}

export default ProgramFeesModal
