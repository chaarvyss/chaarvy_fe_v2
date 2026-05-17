'use client'

import { Button, Stack } from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useMemo, useRef, useState } from 'react'

import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ProgramFeesDetailsProps } from 'src/pages/Admin/programs'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

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

  const updateCell = ({ row, sourceField, targetField, copiedChanges }: any) => {
    if (sourceField === targetField || !(targetField in row)) {
      return
    }

    const value = row[sourceField]

    if (!validateValue(value)) {
      return
    }

    row[targetField] = value

    copiedChanges[getFieldKey(row.feeTypeId, targetField)] = {
      value
    }
  }

  const updateRows = (updates: Record<string, any>) => {
    setRowData(prev => prev.map(row => updates[row.feeTypeId] || row))
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
    const key = getFieldKey(params.data.feeTypeId, params.colDef.field)

    return {
      textAlign: 'center',

      ...(changes[key] && {
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
      mediums: [
        {
          medium_id: 'med-1',
          medium_name: 'Telugu',
          sequence: 1,
          sections: [
            { section_id: 'sec-1', section_name: 'A', sequence: 1 },
            { section_id: 'sec-2', section_name: 'B', sequence: 2 },
            { section_id: 'sec-3', section_name: 'C', sequence: 3 }
          ]
        },
        {
          medium_id: 'med-2',
          medium_name: 'English',
          sequence: 2,
          sections: [
            { section_id: 'sec-1', section_name: 'A', sequence: 1 },
            { section_id: 'sec-2', section_name: 'B', sequence: 2 }
          ]
        }
      ]
    },
    {
      segment_name: 'L.K.G',
      segment_id: 'seg-2',
      sequence: 1,
      mediums: [
        {
          medium_id: 'med-1',
          medium_name: 'Telugu',
          sequence: 1,
          sections: [
            { section_id: 'sec-1', section_name: 'A', sequence: 1 },
            { section_id: 'sec-2', section_name: 'B', sequence: 2 }
          ]
        },
        {
          medium_id: 'med-2',
          medium_name: 'English',
          sequence: 2,
          sections: [{ section_id: 'sec-1', section_name: 'A', sequence: 1 }]
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

                segments: []
              }
            }

            map[medium.medium_id].segments.push({
              segment_id: segment.segment_id,

              segment_name: segment.segment_name,

              sequence: segment.sequence,

              sections: [...medium.sections].sort((a, b) => a.sequence - b.sequence)
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

    const updates: Record<string, any> = {}

    const copiedChanges: Record<string, any> = {}

    api.forEachNode(node => {
      const row = {
        ...node.data
      }

      const copy = (
        sourceField: string,

        targetField: string
      ) => {
        updateCell({
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

      updates[row.feeTypeId] = row
    })

    setChanges(prev => ({
      ...prev,
      ...copiedChanges
    }))

    updateRows(updates)
  }

  /*****************************************
 COLUMN DEFS
******************************************/

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
          headerName: medium.medium_name,

          headerGroupComponent: HeaderCopy,

          headerGroupComponentParams: getHeaderProps(medium.medium_name, 'medium', {
            mediumId: medium.medium_id
          }),

          children: medium.segments.map(
            (segment: any): ColGroupDef => ({
              headerName: segment.segment_name,

              headerGroupComponent: HeaderCopy,

              headerGroupComponentParams: getHeaderProps(segment.segment_name, 'segment', {
                segmentId: segment.segment_id,

                mediumId: medium.medium_id
              }),

              children: segment.sections.map(
                (section: any): ColDef => ({
                  headerName: section.section_name,

                  headerComponent: HeaderCopy,

                  headerComponentParams: getHeaderProps(section.section_name, 'section', {
                    sectionId: section.section_id,

                    segmentId: segment.segment_id,

                    mediumId: medium.medium_id
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
            height: '80vh'
          }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            getRowId={p => String(p.data.feeTypeId)}
            onCellValueChanged={onCellValueChanged}
            defaultColDef={{
              resizable: true
            }}
          />
        </div>
      </>
    </ChaarvyModal>
  )
}

export default ProgramFeesModal
