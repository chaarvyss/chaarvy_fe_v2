// 'use client'

// import { LoadingButton } from '@mui/lab'
// import { Box, Chip, Stack, Typography } from '@mui/material'
// import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
// import { AgGridReact } from 'ag-grid-react'
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// import 'ag-grid-community/styles/ag-theme-alpine.css'

// import { ToastVariants, useToast } from 'src/@core/context/toastContext'
// import { FeesTypesResponse, ProgramFeesDataResponse } from 'src/lib/types'
// import { CreateProgramFeesPayload, useCreateUpdateProgramFeesMutation } from 'src/store/services/feesServices'
// import { ProgramFeesSegmentHeaderDataResponse } from 'src/store/services/programServices'

// import HeaderCopy from './HeaderCopy'

// ModuleRegistry.registerModules([AllCommunityModule])

// interface FeesEditorProps {
//   program_id: string
//   segmentData: ProgramFeesSegmentHeaderDataResponse[]
//   feesData: ProgramFeesDataResponse[]
//   feesTypes: FeesTypesResponse[]
// }

// const FeesEditor = ({ program_id, segmentData, feesData, feesTypes }: FeesEditorProps) => {
//   const gridRef = useRef<AgGridReact>(null)

//   const { triggerToast } = useToast()

//   const [rowData, setRowData] = useState<any[]>([])

//   const [createUpdateFees, { isLoading: isSubmitting }] = useCreateUpdateProgramFeesMutation()

//   const [changes, setChanges] = useState<Record<string, any>>({})

//   const getField = (segmentId: string, mediumId: string, sectionId: string) =>
//     `sg_${segmentId}_mid_${mediumId}_sc_${sectionId}`

//   const getFieldKey = (feeTypeId: string, field: string) => `${feeTypeId}_${field}`

//   const getLookupKey = (segmentId: string, mediumId: string, sectionId: string, feeTypeId: string) =>
//     `${segmentId}_${mediumId}_${sectionId}_${feeTypeId}`

//   const isFeeField = (key: string) => key.startsWith('sg_') && !key.endsWith('_id')

//   const validateValue = (value: any) => value !== null && value !== undefined && value !== '' && !Number.isNaN(value)

//   const normalizeFeeValue = (value: any) => {
//     if (value === null || value === undefined || value === '') {
//       return null
//     }

//     const parsed = Number(value)

//     return Number.isFinite(parsed) ? parsed : null
//   }

//   useEffect(() => {
//     setRowData(initialRowData)
//   }, [program_id])

//   const parseNumericValue = (newValue: any, oldValue: any) => {
//     if (newValue === null || newValue === undefined || newValue === '') {
//       return null
//     }

//     const value = typeof newValue === 'string' ? newValue.trim() : newValue

//     if (typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value)) {
//       return oldValue ?? null
//     }

//     const parsed = normalizeFeeValue(value)

//     return parsed === null ? (oldValue ?? null) : parsed
//   }

//   const formatFeeValue = (value: any) => {
//     if (value === null || value === undefined || value === '') {
//       return ''
//     }

//     return String(value)
//   }

//   const hasColumn = (field: string) => {
//     const columns = gridRef.current?.api.getColumns() || []

//     return columns.some(col => col.getColId() === field)
//   }

//   const updateCell = ({ node, sourceField, targetField, copiedChanges, copiedRows }: any) => {
//     if (sourceField === targetField) {
//       return
//     }

//     const value = node.data[sourceField]

//     if (!validateValue(value)) {
//       return
//     }

//     node.setDataValue(targetField, value)

//     copiedChanges[getFieldKey(node.data.feeTypeId, targetField)] = {
//       value
//     }

//     if (!copiedRows[node.data.feeTypeId]) {
//       copiedRows[node.data.feeTypeId] = {}
//     }

//     copiedRows[node.data.feeTypeId][targetField] = value
//   }

//   const copyMediumValues = ({ node, source, targets, copiedChanges, copiedRows }: any) => {
//     const sourceMedium = source.mediumId

//     const sourceMediumConfig = mediumMap.find((medium: any) => medium.medium_id === sourceMedium)

//     if (!sourceMediumConfig) {
//       return
//     }

//     targets.forEach((targetMedium: string) => {
//       sourceMediumConfig.segments.forEach((segment: any) => {
//         segment.sections.forEach((section: any) => {
//           const sourceField = getField(segment.segment_id, sourceMedium, section.section_id)

//           const targetField = getField(segment.segment_id, targetMedium, section.section_id)

//           if (!hasColumn(targetField)) {
//             return
//           }

//           updateCell({
//             node,
//             sourceField,
//             targetField,
//             copiedChanges,
//             copiedRows
//           })
//         })
//       })
//     })
//   }

//   const copySegmentValues = ({ node, source, targets, copiedChanges, copiedRows }: any) => {
//     const { segmentId, mediumId } = source

//     const { mediums, segments } = targets

//     Object.keys(node.data)
//       .filter(key => key.startsWith(`sg_${segmentId}_mid_${mediumId}`) && !key.endsWith('_id'))
//       .forEach(sourceField => {
//         const sectionId = sourceField.split('_sc_')[1]

//         mediums.forEach((targetMedium: string) => {
//           segments.forEach((targetSegment: string) => {
//             if (targetMedium === mediumId && targetSegment === segmentId) {
//               return
//             }

//             const targetField = getField(targetSegment, targetMedium, sectionId)

//             if (!hasColumn(targetField)) {
//               return
//             }

//             updateCell({
//               node,
//               sourceField,
//               targetField,
//               copiedChanges,
//               copiedRows
//             })
//           })
//         })
//       })
//   }

//   const copySectionValues = ({ node, source, targets, copiedChanges, copiedRows }: any) => {
//     const { sectionId, segmentId, mediumId } = source

//     const { mediums, segments, sections } = targets

//     const sourceField = getField(segmentId, mediumId, sectionId)

//     mediums.forEach((targetMedium: string) => {
//       segments.forEach((targetSegment: string) => {
//         sections.forEach((targetSection: string) => {
//           if (targetMedium === mediumId && targetSegment === segmentId && targetSection === sectionId) {
//             return
//           }

//           const targetField = getField(targetSegment, targetMedium, targetSection)

//           if (!hasColumn(targetField)) {
//             return
//           }

//           updateCell({
//             node,
//             sourceField,
//             targetField,
//             copiedChanges,
//             copiedRows
//           })
//         })
//       })
//     })
//   }

//   const getHeaderProps = (displayName: string, type: string, meta: any) => ({
//     displayName,
//     type,
//     meta,
//     onCopy: handleCopy,

//     ...(type === 'medium'
//       ? {
//           copyOptions: mediumMap
//             .filter((x: any) => x.medium_id !== meta.mediumId)
//             .map((x: any) => ({
//               id: x.medium_id,
//               label: x.medium_name
//             }))
//         }
//       : {
//           copyData: {
//             mediumMap
//           }
//         })
//   })

//   const cellStyle = (params: any) => {
//     const field = params.colDef.field

//     const feeTypeId = params.data.feeTypeId

//     const originalValue = originalRowDataRef.current[feeTypeId]?.[field]

//     const currentValue = params.value

//     const changed = String(originalValue ?? '') !== String(currentValue ?? '')

//     return {
//       textAlign: 'center',

//       ...(changed && {
//         backgroundColor: '#FFF9C4'
//       })
//     }
//   }

//   const feesLookup = useMemo(() => {
//     return (feesData ?? []).reduce(
//       (acc, item) => {
//         const key = getLookupKey(item.segment_id, item.medium_id, item.section_id, item.fees_type_id)

//         acc[key] = item

//         return acc
//       },
//       {} as Record<string, any>
//     )
//   }, [feesData])

//   const mediumMap = useMemo(() => {
//     const map: Record<string, any> = {}

//     ;[...(segmentData ?? [])]
//       .sort((a, b) => a.sequence - b.sequence)
//       .forEach(segment => {
//         ;[...(segment.mediums ?? [])]
//           .sort((a, b) => a.sequence - b.sequence)
//           .forEach(medium => {
//             if (!map[medium.medium_id]) {
//               map[medium.medium_id] = {
//                 medium_id: medium.medium_id,
//                 medium_name: medium.medium_name,
//                 sequence: medium.sequence,
//                 color: medium.color,
//                 segments: []
//               }
//             }

//             map[medium.medium_id].segments.push({
//               segment_id: segment.segment_id,
//               segment_name: segment.segment_name,
//               sequence: segment.sequence,
//               color: segment.color,
//               sections: [...medium.sections]
//                 .sort((a, b) => a.sequence - b.sequence)
//                 .map(section => ({
//                   ...section
//                 }))
//             })
//           })
//       })

//     return Object.values(map).sort((a: any, b: any) => a.sequence - b.sequence)
//   }, [segmentData])

//   const handleCopy = (data: any) => {
//     const api = gridRef.current?.api

//     if (!api) return

//     const copiedChanges: Record<string, any> = {}
//     const copiedRows: Record<string, Record<string, any>> = {}

//     api.forEachNode(node => {
//       if (data.type === 'medium') {
//         copyMediumValues({
//           node,
//           source: data.source,
//           targets: data.targets,
//           copiedChanges,
//           copiedRows
//         })
//       }

//       if (data.type === 'segment') {
//         copySegmentValues({
//           node,
//           source: data.source,
//           targets: data.targets,
//           copiedChanges,
//           copiedRows
//         })
//       }

//       if (data.type === 'section') {
//         copySectionValues({
//           node,
//           source: data.source,
//           targets: data.targets,
//           copiedChanges,
//           copiedRows
//         })
//       }
//     })

//     setRowData(prev =>
//       prev.map(row => {
//         const rowUpdates = copiedRows[row.feeTypeId]

//         if (!rowUpdates) {
//           return row
//         }

//         return {
//           ...row,
//           ...rowUpdates
//         }
//       })
//     )

//     setChanges(prev => ({
//       ...prev,
//       ...copiedChanges
//     }))
//   }

//   const getHeaderClass = (type: 'medium' | 'segment' | 'section', id: string) => {
//     return `${type}-${id}`
//   }

//   const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
//     return [
//       {
//         headerName: 'Fee Type',
//         field: 'feeType',
//         pinned: 'left' as const,
//         width: 180,
//         editable: false
//       },

//       ...mediumMap.map(
//         (medium: any): ColGroupDef => ({
//           headerStyle: {
//             background: medium.color,
//             textAlign: 'center',
//             fontWeight: 600,
//             border: '1px solid #ddd'
//           },
//           headerName: medium.medium_name,
//           headerClass: getHeaderClass('medium', medium.medium_id),
//           headerGroupComponent: HeaderCopy,
//           headerGroupComponentParams: getHeaderProps(medium.medium_name, 'medium', {
//             mediumId: medium.medium_id
//           }),

//           children: medium.segments.map(
//             (segment: any): ColGroupDef => ({
//               headerStyle: {
//                 background: segment.color,
//                 textAlign: 'center',
//                 fontWeight: 600,
//                 border: '1px solid #ddd'
//               },
//               headerName: segment.segment_name,

//               headerClass: getHeaderClass('segment', segment.segment_id),

//               headerGroupComponent: HeaderCopy,

//               headerGroupComponentParams: getHeaderProps(segment.segment_name, 'segment', {
//                 segmentId: segment.segment_id,

//                 mediumId: medium.medium_id,
//                 headerStyle: {
//                   background: segment.color
//                 }
//               }),

//               children: segment.sections.map(
//                 (section: any): ColDef => ({
//                   headerStyle: {
//                     background: section.color,
//                     textAlign: 'center',
//                     fontWeight: 600,
//                     border: '1px solid #ddd'
//                   },
//                   headerName: section.section_name,

//                   headerClass: getHeaderClass('section', section.section_id),

//                   headerComponent: HeaderCopy,

//                   headerComponentParams: getHeaderProps(section.section_name, 'section', {
//                     sectionId: section.section_id,

//                     segmentId: segment.segment_id,

//                     mediumId: medium.medium_id,
//                     headerStyle: {
//                       background: section.color
//                     }
//                   }),

//                   field: getField(segment.segment_id, medium.medium_id, section.section_id),

//                   editable: params => params.data?.feeTypeId !== 'TOTAL',
//                   cellEditor: 'agNumberCellEditor',

//                   valueParser: params => parseNumericValue(params.newValue, params.oldValue),

//                   valueFormatter: params => formatFeeValue(params.value),

//                   width: 120,

//                   cellStyle
//                 })
//               )
//             })
//           )
//         })
//       )
//     ]
//   }, [mediumMap])
//   const initialRowData = useMemo(() => {
//     return feesTypes
//       .filter(each => each.status === 1)
//       .map(fee => {
//         const row: any = {
//           feeType: fee.fees_type,
//           feeTypeId: fee.fees_type_id
//         }

//         segmentData.forEach(segment => {
//           segment.mediums.forEach(medium => {
//             medium.sections.forEach(section => {
//               const field = getField(segment.segment_id, medium.medium_id, section.section_id)

//               const existing =
//                 feesLookup[getLookupKey(segment.segment_id, medium.medium_id, section.section_id, fee.fees_type_id)]

//               row[field] = normalizeFeeValue(existing?.fees)
//               row[`${field}_id`] = existing?.program_fees_id
//             })
//           })
//         })

//         return row
//       })
//   }, [feesTypes, segmentData, feesLookup])

//   const originalRowDataRef = useRef<Record<string, any>>({})

//   useEffect(() => {
//     const data: Record<string, any> = {}
//     initialRowData.forEach(row => {
//       data[row.feeTypeId] = { ...row }
//     })
//     originalRowDataRef.current = data
//   }, [initialRowData])

//   const totalRow = useMemo(() => {
//     const row: Record<string, any> = {
//       feeType: 'TOTAL',
//       feeTypeId: 'TOTAL'
//     }

//     const fields = Object.keys(rowData[0] || {}).filter(isFeeField)

//     fields.forEach(field => {
//       row[field] = rowData.reduce((sum, item) => {
//         const value = normalizeFeeValue(item[field]) ?? 0

//         return sum + value
//       }, 0)
//     })

//     return [row]
//   }, [rowData])

//   const onCellValueChanged = (params: CellValueChangedEvent) => {
//     const field = params.colDef.field as string
//     const feeTypeId = params.data.feeTypeId
//     const normalizedValue = normalizeFeeValue(params.newValue)
//     const key = `${feeTypeId}_${field}`
//     setChanges(prev => ({
//       ...prev,
//       [key]: {
//         value: normalizedValue
//       }
//     }))

//     setRowData(prev =>
//       prev.map(row => {
//         if (row.feeTypeId === feeTypeId) {
//           return {
//             ...row,

//             [field]: normalizedValue
//           }
//         }

//         return row
//       })
//     )
//   }

//   const saveChanges = () => {
//     const payload: CreateProgramFeesPayload[] = Object.entries(changes)

//       .map(([key, value]: any) => {
//         const [feeTypeId, , segmentId, , mediumId, , sectionId] = key.split('_')
//         const field = getField(segmentId, mediumId, sectionId)
//         const row = rowData.find(x => x.feeTypeId === feeTypeId)

//         return {
//           program_fees_id: row?.[`${field}_id`] ?? null,
//           segment_id: segmentId,
//           medium_id: mediumId,
//           section_id: sectionId,
//           fees_type: feeTypeId,
//           fees: value.value
//         }
//       })
//     if (program_id)
//       createUpdateFees({ body: payload, program_id })
//         .unwrap()
//         .then(() => {
//           triggerToast('Fees details updated successfully', { variant: ToastVariants.SUCCESS })
//         })
//         .catch(e => triggerToast(e, { variant: ToastVariants.ERROR }))
//   }

//   const [hiddenColumns, setHiddenColumns] = useState<
//     {
//       id: string
//       name: string
//       colIds: string[]
//     }[]
//   >([])

//   const syncHiddenColumns = useCallback(() => {
//     const columns = gridRef.current?.api.getColumns()

//     if (!columns) return

//     const hiddenMap = new Map<
//       string,
//       {
//         id: string
//         name: string
//         colIds: string[]
//       }
//     >()

//     columns
//       .filter(col => !col.isVisible())
//       .forEach(col => {
//         const groups: string[] = []

//         let parent = col.getParent()

//         while (parent) {
//           const header = parent.getColGroupDef()?.headerName

//           if (header) {
//             groups.unshift(header)
//           }

//           parent = parent.getParent()
//         }

//         const colId = col.getColId()

//         for (let level = 1; level <= groups.length + 1; level++) {
//           const path = level <= groups.length ? groups.slice(0, level) : [...groups, col.getColDef()?.headerName]

//           const key = path.join('__')

//           if (!hiddenMap.has(key)) {
//             hiddenMap.set(key, {
//               id: key,
//               name: path.join(' > '),
//               colIds: []
//             })
//           }

//           hiddenMap.get(key)!.colIds.push(colId)
//         }
//       })

//     const values = Array.from(hiddenMap.values())

//     values.forEach(item => {
//       item.colIds = [...new Set(item.colIds)]
//     })

//     const result = values.filter(item => {
//       return !values.some(
//         other => other !== item && other.id.startsWith(item.id + '__') && other.colIds.length === item.colIds.length
//       )
//     })

//     setHiddenColumns(result)
//   }, [])

//   return (
//     <>
//       <Stack direction='row' justifyContent='space-between' marginX={4} mb={2}>
//         <Typography variant='h6'>Program Fees Details</Typography>
//         <LoadingButton loading={isSubmitting} color='success' onClick={saveChanges} variant='outlined'>
//           Save
//         </LoadingButton>
//       </Stack>

//       <div
//         className='ag-theme-alpine'
//         style={{
//           height: '70vh'
//         }}
//       >
//         {hiddenColumns.length > 0 && (
//           <Box
//             display='flex'
//             gap={1}
//             mb={2}
//             flexWrap='wrap'
//             sx={{
//               p: 1,
//               border: '1px solid #eee',
//               borderRadius: 2,
//               background: '#fafafa'
//             }}
//           >
//             <Typography fontWeight={600}>Hidden:</Typography>

//             {hiddenColumns.map(column => (
//               <Chip
//                 key={column.id}
//                 label={column.name}
//                 onDelete={() => {
//                   gridRef.current?.api?.setColumnsVisible(column?.colIds, true)
//                 }}
//               />
//             ))}
//           </Box>
//         )}

//         <AgGridReact
//           ref={gridRef}
//           rowData={rowData}
//           columnDefs={columnDefs}
//           getRowId={p => String(p.data.feeTypeId)}
//           onCellValueChanged={onCellValueChanged}
//           defaultColDef={{
//             resizable: true,
//             sortable: true,
//             filter: false
//           }}
//           pinnedBottomRowData={totalRow}
//           undoRedoCellEditing
//           undoRedoCellEditingLimit={100}
//           onColumnVisible={syncHiddenColumns}
//           onColumnMoved={syncHiddenColumns}
//           suppressDragLeaveHidesColumns={false}
//         />
//       </div>
//     </>
//   )
// }

// export default FeesEditor

'use client'

import { LoadingButton } from '@mui/lab'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { FeesTypesResponse, ProgramFeesDataResponse } from 'src/lib/types'
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

// Helper functions moved outside component to prevent recreation
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
  const [hiddenColumns, setHiddenColumns] = useState<{ id: string; name: string; colIds: string[] }[]>([])

  const [createUpdateFees, { isLoading: isSubmitting }] = useCreateUpdateProgramFeesMutation()

  // --- Data Memos ---
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

    // Use slice() to avoid mutating original props before sorting
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

  // --- Effects ---
  // FIX: Populates rowData automatically when API data arrives (initialRowData calculates)
  useEffect(() => {
    setRowData(initialRowData)

    const originalDataDict: Record<string, any> = {}
    initialRowData.forEach(row => {
      originalDataDict[row.feeTypeId] = { ...row }
    })
    originalRowDataRef.current = originalDataDict
  }, [initialRowData])

  // --- Grid Computations ---
  const totalRow = useMemo(() => {
    const row: Record<string, any> = { feeType: 'TOTAL', feeTypeId: 'TOTAL' }
    if (!rowData.length) return [row]

    const fields = Object.keys(rowData[0]).filter(key => key.startsWith('sg_') && !key.endsWith('_id'))
    fields.forEach(field => {
      row[field] = rowData.reduce((sum, item) => sum + (normalizeFeeValue(item[field]) ?? 0), 0)
    })

    return [row]
  }, [rowData])

  // --- Handlers ---
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

  // Generalized structural copies
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

  const syncHiddenColumns = useCallback(() => {
    const columns = gridRef.current?.api.getColumns()
    if (!columns) return

    const hiddenMap = new Map<string, { id: string; name: string; colIds: string[] }>()

    columns
      .filter(col => !col.isVisible())
      .forEach(col => {
        const groups: string[] = []
        let parent = col.getParent()
        while (parent) {
          if (parent.getColGroupDef()?.headerName) groups.unshift(parent.getColGroupDef()!.headerName!)
          parent = parent.getParent()
        }

        const colId = col.getColId()
        for (let level = 1; level <= groups.length + 1; level++) {
          const path = level <= groups.length ? groups.slice(0, level) : [...groups, col.getColDef()?.headerName]
          const key = path.join('__')

          if (!hiddenMap.has(key)) {
            hiddenMap.set(key, { id: key, name: path.join(' > '), colIds: [] })
          }
          hiddenMap.get(key)!.colIds.push(colId)
        }
      })

    const values = Array.from(hiddenMap.values())
    values.forEach(item => {
      item.colIds = [...new Set(item.colIds)]
    })

    setHiddenColumns(
      values.filter(
        item =>
          !values.some(
            other => other !== item && other.id.startsWith(item.id + '__') && other.colIds.length === item.colIds.length
          )
      )
    )
  }, [])

  // --- Column Defs ---
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

      <div className='ag-theme-alpine' style={{ height: '70vh' }}>
        {hiddenColumns.length > 0 && (
          <Box
            display='flex'
            gap={1}
            mb={2}
            flexWrap='wrap'
            sx={{ p: 1, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}
          >
            <Typography fontWeight={600}>Hidden:</Typography>
            {hiddenColumns.map(column => (
              <Chip
                key={column.id}
                label={column.name}
                onDelete={() => gridRef.current?.api?.setColumnsVisible(column.colIds, true)}
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
          defaultColDef={{ resizable: true, sortable: true, filter: false }}
          pinnedBottomRowData={totalRow}
          undoRedoCellEditing
          undoRedoCellEditingLimit={100}
          onColumnVisible={syncHiddenColumns}
          onColumnMoved={syncHiddenColumns}
          suppressDragLeaveHidesColumns={false}
        />
      </div>
    </>
  )
}

export default FeesEditor
