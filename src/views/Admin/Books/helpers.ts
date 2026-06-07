import { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import { EditedDataTableOnSubmitPayload } from 'src/reusable_components/Table/ChaarvyDataTable'
import { CreateBookRequest } from 'src/store/services/adminServices'

export const generateSpecificBooksPayload = (
  payload: EditedDataTableOnSubmitPayload,
  filterData: CascadingSelectorState
): CreateBookRequest[] | undefined => {
  const { program, segment, medium } = filterData

  // Normalize program to always be an array
  const programsArray = Array.isArray(program) ? program : program ? [program] : []

  if (!programsArray.length || !segment || !medium) return undefined

  const { created, updated, deleted } = payload
  const result: CreateBookRequest[] = []

  // 1. CREATED: Apply the multi-select loop ONLY to brand new rows
  created.forEach(c => {
    if (!c || Object.values(c).some(v => v === undefined)) return

    programsArray.forEach(progId => {
      result.push({
        book_name: c.book_name ?? '',
        price: Number(c.price ?? 0),
        available_quantity: Number(c.available_quantity ?? 0),
        program_id: progId,
        segment_id: segment as string,
        medium_id: medium as string,
        isCommon: 0,
        status: 1
      })
    })
  })

  // 2. UPDATED: Use the existing IDs from the row. DO NOT loop over the dropdown array!
  updated.forEach(u => {
    if (!u?.book_id) return
    result.push({
      book_id: u.book_id,
      mapping_id: u.mapping_id, // Targets the exact curriculum row
      book_name: u.book_name ?? '',
      price: Number(u.price ?? 0),
      available_quantity: Number(u.available_quantity ?? 0),
      program_id: u.program_id, // Keep the row's original program
      segment_id: u.segment_id, // Keep the row's original segment
      medium_id: u.medium_id, // Keep the row's original medium
      isCommon: 0,
      status: 1,
      had_change: true
    })
  })

  // 3. DELETED: Use the existing IDs from the row.
  deleted.forEach(d => {
    if (!d?.book_id) return
    result.push({
      book_id: d.book_id,
      mapping_id: d.mapping_id,
      book_name: d.book_name,
      price: d.price,
      available_quantity: d.available_quantity,
      program_id: d.program_id,
      segment_id: d.segment_id,
      medium_id: d.medium_id,
      isCommon: 0,
      status: 0,
      had_change: true
    })
  })

  return result
}

export const generateCommonBooksPayload = (payload: EditedDataTableOnSubmitPayload): CreateBookRequest[] => {
  const { created, updated, deleted } = payload
  const result: CreateBookRequest[] = []

  created.forEach(c => {
    if (!c || Object.values(c).some(v => v === undefined)) return
    result.push({
      book_name: c.book_name ?? '',
      price: Number(c.price ?? 0),
      available_quantity: Number(c.available_quantity ?? 0),
      isCommon: 1,
      status: 1
    })
  })

  updated.forEach(u => {
    if (!u?.book_id) return
    result.push({
      book_id: u.book_id,
      book_name: u.book_name ?? '',
      price: Number(u.price ?? 0),
      available_quantity: Number(u.available_quantity ?? 0),
      isCommon: 1,
      status: 1,
      had_change: true
    })
  })

  deleted.forEach(d => {
    if (!d?.book_id) return
    result.push({
      book_id: d.book_id,
      book_name: d.book_name,
      price: d.price,
      available_quantity: d.available_quantity,
      isCommon: 1,
      status: 0,
      had_change: true
    })
  })

  return result
}
