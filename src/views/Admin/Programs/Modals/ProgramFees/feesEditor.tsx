'use client'

import { LoadingButton } from '@mui/lab'
import { Box, Stack, Typography } from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { FeesTypesResponse, ProgramFeesDataResponse } from 'src/lib/types'
import { CustomDataGrid } from 'src/reusable_components/DataGrid'
import { CreateProgramFeesPayload, useCreateUpdateProgramFeesMutation } from 'src/store/services/feesServices'
import { ProgramFeesSegmentHeaderDataResponse } from 'src/store/services/programServices'

import HeaderCopy from './HeaderCopy'

ModuleRegistry.registerModules([AllCommunityModule])

interface FeesEditorProps {
  program_id: string
  segmentData: ProgramFeesSegmentHeaderDataResponse[]
  feesData: ProgramFeesDataResponse[]
  feesTypes: FeesTypesResponse[]
}

const normalizeFeeValue = (value: any) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

const getField = (segmentId: string, mediumId: string, sectionId: string) =>
  `sg_${segmentId}_mid_${mediumId}_sc_${sectionId}`

const getLookupKey = (segmentId: string, mediumId: string, sectionId: string, feeTypeId: string) =>
  `${segmentId}_${mediumId}_${sectionId}_${feeTypeId}`

const FeesEditor = ({ program_id, segmentData, feesData, feesTypes }: FeesEditorProps) => {
  const gridRef = useRef<AgGridReact>(null)
  const originalRowDataRef = useRef<Record<string, any>>({})
  const { triggerToast } = useToast()

  const [rowData, setRowData] = useState<any[]>([])
  const [changes, setChanges] = useState<Record<string, any>>({})

  const [createUpdateFees, { isLoading: isSubmitting }] = useCreateUpdateProgramFeesMutation()

  const feesLookup = useMemo(() => {
    return (feesData ?? []).reduce(
      (acc, item) => {
        acc[getLookupKey(item.segment_id, item.medium_id, item.section_id, item.fees_type_id)] = item

        return acc
      },
      {} as Record<string, any>
    )
  }, [feesData])

  const mediumMap = useMemo(() => {
    const map = new Map<string, any>()

    ;(segmentData ?? [])
      .slice()
      .sort((a, b) => a.sequence - b.sequence)
      .forEach(segment => {
        ;(segment.mediums ?? [])
          .slice()
          .sort((a, b) => a.sequence - b.sequence)
          .forEach(medium => {
            if (!map.has(medium.medium_id)) {
              map.set(medium.medium_id, {
                medium_id: medium.medium_id,
                medium_name: medium.medium_name,
                sequence: medium.sequence,
                color: medium.color,
                segments: []
              })
            }

            map.get(medium.medium_id).segments.push({
              segment_id: segment.segment_id,
              segment_name: segment.segment_name,
              sequence: segment.sequence,
              color: segment.color,
              sections: [...medium.sections].sort((a, b) => a.sequence - b.sequence)
            })
          })
      })

    return Array.from(map.values()).sort((a: any, b: any) => a.sequence - b.sequence)
  }, [segmentData])

  const initialRowData = useMemo(() => {
    return feesTypes
      .filter(each => each.status === 1)
      .map(fee => {
        const row: any = { feeType: fee.fees_type, feeTypeId: fee.fees_type_id }

        segmentData?.forEach(segment => {
          segment.mediums?.forEach(medium => {
            medium.sections?.forEach(section => {
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

  useEffect(() => {
    setRowData(initialRowData)

    const originalDataDict: Record<string, any> = {}
    initialRowData.forEach(row => {
      originalDataDict[row.feeTypeId] = { ...row }
    })
    originalRowDataRef.current = originalDataDict
  }, [initialRowData])

  const totalRow = useMemo(() => {
    const row: Record<string, any> = { feeType: 'TOTAL', feeTypeId: 'TOTAL' }
    if (!rowData.length) return [row]

    const fields = Object.keys(rowData[0]).filter(key => key.startsWith('sg_') && !key.endsWith('_id'))
    fields.forEach(field => {
      row[field] = rowData.reduce((sum, item) => sum + (normalizeFeeValue(item[field]) ?? 0), 0)
    })

    return [row]
  }, [rowData])

  const hasColumn = (field: string) => {
    return gridRef.current?.api.getColumns()?.some(col => col.getColId() === field) ?? false
  }

  const updateCell = ({ node, sourceField, targetField, copiedChanges, copiedRows }: any) => {
    if (sourceField === targetField) return

    const value = node.data[sourceField]
    if (value === null || value === undefined || value === '') return

    node.setDataValue(targetField, value)

    copiedChanges[`${node.data.feeTypeId}_${targetField}`] = { value }
    if (!copiedRows[node.data.feeTypeId]) copiedRows[node.data.feeTypeId] = {}
    copiedRows[node.data.feeTypeId][targetField] = value
  }

  const handleCopy = (data: any) => {
    const api = gridRef.current?.api
    if (!api) return

    const copiedChanges: Record<string, any> = {}
    const copiedRows: Record<string, Record<string, any>> = {}

    api.forEachNode(node => {
      const { source, targets } = data

      if (data.type === 'medium') {
        const sourceMediumConfig = mediumMap.find((m: any) => m.medium_id === source.mediumId)
        targets.forEach((targetMedium: string) => {
          sourceMediumConfig?.segments.forEach((segment: any) => {
            segment.sections.forEach((section: any) => {
              const sField = getField(segment.segment_id, source.mediumId, section.section_id)
              const tField = getField(segment.segment_id, targetMedium, section.section_id)
              if (hasColumn(tField))
                updateCell({ node, sourceField: sField, targetField: tField, copiedChanges, copiedRows })
            })
          })
        })
      } else if (data.type === 'segment') {
        const { segmentId, mediumId } = source
        Object.keys(node.data)
          .filter(k => k.startsWith(`sg_${segmentId}_mid_${mediumId}`) && !k.endsWith('_id'))
          .forEach(sField => {
            const sectionId = sField.split('_sc_')[1]
            targets.mediums.forEach((tMedium: string) => {
              targets.segments.forEach((tSegment: string) => {
                if (tMedium === mediumId && tSegment === segmentId) return
                const tField = getField(tSegment, tMedium, sectionId)
                if (hasColumn(tField))
                  updateCell({ node, sourceField: sField, targetField: tField, copiedChanges, copiedRows })
              })
            })
          })
      } else if (data.type === 'section') {
        const { sectionId, segmentId, mediumId } = source
        const sField = getField(segmentId, mediumId, sectionId)
        targets.mediums.forEach((tMedium: string) => {
          targets.segments.forEach((tSegment: string) => {
            targets.sections.forEach((tSection: string) => {
              if (tMedium === mediumId && tSegment === segmentId && tSection === sectionId) return
              const tField = getField(tSegment, tMedium, tSection)
              if (hasColumn(tField))
                updateCell({ node, sourceField: sField, targetField: tField, copiedChanges, copiedRows })
            })
          })
        })
      }
    })

    setRowData(prev => prev.map(row => (copiedRows[row.feeTypeId] ? { ...row, ...copiedRows[row.feeTypeId] } : row)))
    setChanges(prev => ({ ...prev, ...copiedChanges }))
  }

  const onCellValueChanged = (params: CellValueChangedEvent) => {
    const field = params.colDef.field as string
    const feeTypeId = params.data.feeTypeId
    const normalizedValue = normalizeFeeValue(params.newValue)

    setChanges(prev => ({ ...prev, [`${feeTypeId}_${field}`]: { value: normalizedValue } }))
    setRowData(prev => prev.map(row => (row.feeTypeId === feeTypeId ? { ...row, [field]: normalizedValue } : row)))
  }

  const saveChanges = () => {
    const payload: CreateProgramFeesPayload[] = Object.entries(changes).map(([key, value]) => {
      const [feeTypeId, , segmentId, , mediumId, , sectionId] = key.split('_')
      const field = getField(segmentId, mediumId, sectionId)
      const row = rowData.find(x => x.feeTypeId === feeTypeId)

      return {
        program_fees_id: row?.[`${field}_id`] ?? null,
        segment_id: segmentId,
        medium_id: mediumId,
        section_id: sectionId,
        fees_type: feeTypeId,
        fees: value.value
      }
    })

    if (!program_id || payload.length === 0) return

    createUpdateFees({ body: payload, program_id })
      .unwrap()
      .then(() => triggerToast('Fees details updated successfully', { variant: ToastVariants.SUCCESS }))
      .catch(e => triggerToast(e?.data?.message || 'Failed to save', { variant: ToastVariants.ERROR }))
  }

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: 'Fee Type',
        field: 'feeType',
        pinned: 'left',
        width: 180,
        editable: false
      },
      ...mediumMap.map(
        (medium: any): ColGroupDef => ({
          headerStyle: { background: medium.color, textAlign: 'center', fontWeight: 600, border: '1px solid #ddd' },
          headerName: medium.medium_name,
          headerClass: `medium-${medium.medium_id}`,
          headerGroupComponent: HeaderCopy,
          headerGroupComponentParams: {
            displayName: medium.medium_name,
            type: 'medium',
            meta: { mediumId: medium.medium_id },
            onCopy: handleCopy,
            copyOptions: mediumMap
              .filter((x: any) => x.medium_id !== medium.medium_id)
              .map((x: any) => ({ id: x.medium_id, label: x.medium_name }))
          },
          children: medium.segments.map(
            (segment: any): ColGroupDef => ({
              headerStyle: {
                background: segment.color,
                textAlign: 'center',
                fontWeight: 600,
                border: '1px solid #ddd'
              },
              headerName: segment.segment_name,
              headerClass: `segment-${segment.segment_id}`,
              headerGroupComponent: HeaderCopy,
              headerGroupComponentParams: {
                displayName: segment.segment_name,
                type: 'segment',
                meta: {
                  segmentId: segment.segment_id,
                  mediumId: medium.medium_id,
                  headerStyle: { background: segment.color }
                },
                onCopy: handleCopy,
                copyData: { mediumMap }
              },
              children: segment.sections.map(
                (section: any): ColDef => ({
                  headerStyle: {
                    background: section.color,
                    textAlign: 'center',
                    fontWeight: 600,
                    border: '1px solid #ddd'
                  },
                  headerName: section.section_name,
                  headerClass: `section-${section.section_id}`,
                  headerComponent: HeaderCopy,
                  headerComponentParams: {
                    displayName: section.section_name,
                    type: 'section',
                    meta: {
                      sectionId: section.section_id,
                      segmentId: segment.segment_id,
                      mediumId: medium.medium_id,
                      headerStyle: { background: section.color }
                    },
                    onCopy: handleCopy,
                    copyData: { mediumMap }
                  },
                  field: getField(segment.segment_id, medium.medium_id, section.section_id),
                  editable: params => params.data?.feeTypeId !== 'TOTAL',
                  cellEditor: 'agNumberCellEditor',
                  valueParser: params => {
                    const parsed = normalizeFeeValue(params.newValue)

                    return parsed === null ? (params.oldValue ?? null) : parsed
                  },
                  valueFormatter: params => params.value ?? '',
                  width: 120,
                  cellStyle: params => {
                    const field = params.colDef.field!
                    const feeTypeId = params.data.feeTypeId
                    const originalValue = originalRowDataRef.current[feeTypeId]?.[field]
                    const changed = String(originalValue ?? '') !== String(params.value ?? '')

                    return { textAlign: 'center', ...(changed && { backgroundColor: '#FFF9C4' }) }
                  }
                })
              )
            })
          )
        })
      )
    ],
    [mediumMap]
  )

  return (
    <>
      <Stack direction='row' justifyContent='space-between' marginX={4} mb={2}>
        <Typography variant='h6'>Program Fees Details</Typography>
        <LoadingButton
          loading={isSubmitting}
          color='success'
          onClick={saveChanges}
          variant='outlined'
          disabled={Object.keys(changes).length === 0}
        >
          Save
        </LoadingButton>
      </Stack>

      <Box>
        <CustomDataGrid
          gridRef={gridRef}
          height='70vh'
          rowData={rowData}
          columnDefs={columnDefs}
          getRowId={p => String(p.data.feeTypeId)}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{ resizable: true, sortable: true, filter: false }}
          pinnedBottomRowData={totalRow}
        />
      </Box>
    </>
  )
}

export default FeesEditor
