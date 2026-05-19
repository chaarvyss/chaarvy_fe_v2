'use client'

import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ProgramFeesDetailsProps } from 'src/pages/Admin/programs'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useGetFeesTypesListQuery } from 'src/store/services/listServices'

import HeaderCopy from './HeaderCopy'

type ProgramFeesSegmentHeaderDataResponse = {
  segment_id: string
  segment_name: string
  sequence: number
  color: string
  mediums: {
    medium_id: string
    medium_name: string
    sequence: number
    color: string
    sections: {
      section_id: string
      section_name: string
      sequence: number
      color: string
    }[]
  }[]
}

type ProgramFeesDataResponse = {
  program_fees_id: string
  program_id: string
  segment_id: string
  medium_id: string
  section_id: string
  fees_type_id: string
  fees: number
}

ModuleRegistry.registerModules([AllCommunityModule])

const ProgramFeesModal = ({ isOpen, onClose, selectedProgram }: ProgramFeesDetailsProps) => {
  const gridRef = useRef<AgGridReact>(null)

  const { data: feesTypes } = useGetFeesTypesListQuery()

  const [changes, setChanges] = useState<Record<string, any>>({})

  const segmentData: ProgramFeesSegmentHeaderDataResponse[] = [
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

  const feesData: ProgramFeesDataResponse[] = [
    {
      program_fees_id: 'pfid-1',
      program_id: 'pid-1',
      segment_id: 'seg-1',
      medium_id: 'med-1',
      section_id: 'sec-1',
      fees_type_id: 'ftid-1',
      fees: 2000
    }
  ]

  const getField = (segmentId: string, mediumId: string, sectionId: string) =>
    `sg_${segmentId}_mid_${mediumId}_sc_${sectionId}`

  const getFieldKey = (feeTypeId: string, field: string) => `${feeTypeId}_${field}`

  const getLookupKey = (segmentId: string, mediumId: string, sectionId: string, feeTypeId: string) =>
    `${segmentId}_${mediumId}_${sectionId}_${feeTypeId}`

  const isFeeField = (key: string) => key.startsWith('sg_') && !key.endsWith('_id')

  const validateValue = (value: any) => value !== null && value !== undefined && value !== '' && !Number.isNaN(value)

  const normalizeFeeValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : null
  }

  const formatFeeValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return ''
    }

    return String(value)
  }

  const hasColumn = (field: string) => {
    const columns = gridRef.current?.api.getColumns() || []

    return columns.some(col => col.getColId() === field)
  }

  const updateCell = ({ node, sourceField, targetField, copiedChanges, copiedRows }: any) => {
    if (sourceField === targetField) {
      return
    }

    const value = node.data[sourceField]

    if (!validateValue(value)) {
      return
    }

    node.setDataValue(targetField, value)

    copiedChanges[getFieldKey(node.data.feeTypeId, targetField)] = {
      value
    }

    if (!copiedRows[node.data.feeTypeId]) {
      copiedRows[node.data.feeTypeId] = {}
    }

    copiedRows[node.data.feeTypeId][targetField] = value
  }

  const copyMediumValues = ({ node, source, targets, copiedChanges, copiedRows }: any) => {
    const sourceMedium = source.mediumId

    const sourceMediumConfig = mediumMap.find((medium: any) => medium.medium_id === sourceMedium)

    if (!sourceMediumConfig) {
      return
    }

    targets.forEach((targetMedium: string) => {
      sourceMediumConfig.segments.forEach((segment: any) => {
        segment.sections.forEach((section: any) => {
          const sourceField = getField(segment.segment_id, sourceMedium, section.section_id)

          const targetField = getField(segment.segment_id, targetMedium, section.section_id)

          if (!hasColumn(targetField)) {
            return
          }

          updateCell({
            node,
            sourceField,
            targetField,
            copiedChanges,
            copiedRows
          })
        })
      })
    })
  }

  const copySegmentValues = ({ node, source, targets, copiedChanges, copiedRows }: any) => {
    const { segmentId, mediumId } = source

    const { mediums, segments } = targets

    Object.keys(node.data)
      .filter(key => key.startsWith(`sg_${segmentId}_mid_${mediumId}`) && !key.endsWith('_id'))
      .forEach(sourceField => {
        const sectionId = sourceField.split('_sc_')[1]

        mediums.forEach((targetMedium: string) => {
          segments.forEach((targetSegment: string) => {
            if (targetMedium === mediumId && targetSegment === segmentId) {
              return
            }

            const targetField = getField(targetSegment, targetMedium, sectionId)

            if (!hasColumn(targetField)) {
              return
            }

            updateCell({
              node,
              sourceField,
              targetField,
              copiedChanges,
              copiedRows
            })
          })
        })
      })
  }

  const copySectionValues = ({ node, source, targets, copiedChanges, copiedRows }: any) => {
    const { sectionId, segmentId, mediumId } = source

    const { mediums, segments, sections } = targets

    const sourceField = getField(segmentId, mediumId, sectionId)

    mediums.forEach((targetMedium: string) => {
      segments.forEach((targetSegment: string) => {
        sections.forEach((targetSection: string) => {
          if (targetMedium === mediumId && targetSegment === segmentId && targetSection === sectionId) {
            return
          }

          const targetField = getField(targetSegment, targetMedium, targetSection)

          if (!hasColumn(targetField)) {
            return
          }

          updateCell({
            node,
            sourceField,
            targetField,
            copiedChanges,
            copiedRows
          })
        })
      })
    })
  }

  const getHeaderProps = (displayName: string, type: string, meta: any) => ({
    displayName,
    type,
    meta,
    onCopy: handleCopy,

    ...(type === 'medium'
      ? {
          copyOptions: mediumMap
            .filter((x: any) => x.medium_id !== meta.mediumId)
            .map((x: any) => ({
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

  const feesLookup = useMemo(() => {
    const map: Record<string, any> = {}

    feesData.forEach(item => {
      const key = getLookupKey(item.segment_id, item.medium_id, item.section_id, item.fees_type_id)

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

  const handleCopy = (data: any) => {
    const api = gridRef.current?.api

    if (!api) return

    const copiedChanges: Record<string, any> = {}
    const copiedRows: Record<string, Record<string, any>> = {}

    api.forEachNode(node => {
      if (data.type === 'medium') {
        copyMediumValues({
          node,
          source: data.source,
          targets: data.targets,
          copiedChanges,
          copiedRows
        })
      }

      if (data.type === 'segment') {
        copySegmentValues({
          node,
          source: data.source,
          targets: data.targets,
          copiedChanges,
          copiedRows
        })
      }

      if (data.type === 'section') {
        copySectionValues({
          node,
          source: data.source,
          targets: data.targets,
          copiedChanges,
          copiedRows
        })
      }
    })

    setRowData(prev =>
      prev.map(row => {
        const rowUpdates = copiedRows[row.feeTypeId]

        if (!rowUpdates) {
          return row
        }

        return {
          ...row,
          ...rowUpdates
        }
      })
    )

    setChanges(prev => ({
      ...prev,
      ...copiedChanges
    }))
  }

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

                  editable: params => params.data?.feeTypeId !== 'TOTAL',

                  valueParser: params => normalizeFeeValue(params.newValue),

                  valueFormatter: params => formatFeeValue(params.value),

                  width: 120,

                  cellStyle
                })
              )
            })
          )
        })
      )
    ]
  }, [mediumMap])

  const initialRowData = useMemo(() => {
    return (feesTypes ?? [])
      .filter(each => each.status == 1)
      .map(fee => {
        const row: any = {
          feeType: fee.fees_type,
          feeTypeId: fee.fees_type_id
        }

        segmentData.forEach(segment => {
          segment.mediums.forEach(medium => {
            medium.sections.forEach(section => {
              const field = getField(segment.segment_id, medium.medium_id, section.section_id)

              const existing =
                feesLookup[getLookupKey(segment.segment_id, medium.medium_id, section.section_id, fee.fees_type_id)]

              row[field] = normalizeFeeValue(existing?.fees)

              row[`${field}_id`] = existing?.program_fees_id
            })
          })
        })

        return row
      })
  }, [feesTypes, segmentData, feesLookup])

  const originalRowDataRef = useRef<Record<string, any>>({})
  useEffect(() => {
    const data: Record<string, any> = {}
    initialRowData.forEach(row => {
      data[row.feeTypeId] = { ...row }
    })
    originalRowDataRef.current = data
  }, [initialRowData])

  const [rowData, setRowData] = useState(initialRowData)

  const totalRow = useMemo(() => {
    const row: Record<string, any> = {
      feeType: 'TOTAL',
      feeTypeId: 'TOTAL'
    }

    const fields = Object.keys(rowData[0] || {}).filter(isFeeField)

    fields.forEach(field => {
      row[field] = rowData.reduce((sum, item) => {
        const value = normalizeFeeValue(item[field]) ?? 0

        return sum + value
      }, 0)
    })

    return [row]
  }, [rowData])

  const onCellValueChanged = (params: CellValueChangedEvent) => {
    const field = params.colDef.field as string

    const feeTypeId = params.data.feeTypeId

    const normalizedValue = normalizeFeeValue(params.newValue)

    const key = `${feeTypeId}_${field}`

    setChanges(prev => ({
      ...prev,

      [key]: {
        value: normalizedValue
      }
    }))

    setRowData(prev =>
      prev.map(row => {
        if (row.feeTypeId === feeTypeId) {
          return {
            ...row,

            [field]: normalizedValue
          }
        }

        return row
      })
    )
  }

  const saveChanges = () => {
    const payload = Object.entries(changes)

      .map(([key, value]: any) => {
        const [feeTypeId, , segmentId, , mediumId, , sectionId] = key.split('_')

        const field = getField(segmentId, mediumId, sectionId)

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
              sortable: true,
              filter: false
            }}
            pinnedBottomRowData={totalRow}
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
