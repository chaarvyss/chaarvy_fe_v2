import { BooksListData } from 'src/lib/types'
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

  // 2. UPDATED: Smart "Diffing" to Add, Update, or Remove mappings dynamically
  updated.forEach(u => {
    if (!u?.book_id) return

    const existingProgramIds: string[] = u.program_ids || []
    const programMappings: Record<string, string> = u.program_mappings || {}

    // Figure out what needs to happen to each mapping
    const programsToAdd = programsArray.filter(id => !existingProgramIds.includes(id))
    const programsToKeep = programsArray.filter(id => existingProgramIds.includes(id))
    const programsToRemove = existingProgramIds.filter(id => !programsArray.includes(id))

    const baseData = {
      book_id: u.book_id,
      book_name: u.book_name ?? '',
      price: Number(u.price ?? 0),
      available_quantity: Number(u.available_quantity ?? 0),
      segment_id: segment as string,
      medium_id: medium as string,
      isCommon: 0,
      had_change: true
    }

    // A. Add New Mappings (no mapping_id so backend creates it)
    programsToAdd.forEach(progId => {
      result.push({ ...baseData, program_id: progId, status: 1 })
    })

    // B. Keep/Update Existing Mappings (pass mapping_id to update safely)
    programsToKeep.forEach(progId => {
      result.push({ ...baseData, program_id: progId, mapping_id: programMappings[progId], status: 1 })
    })

    // C. Remove Deselected Mappings (pass mapping_id and status: 0 to soft-delete)
    programsToRemove.forEach(progId => {
      result.push({ ...baseData, program_id: progId, mapping_id: programMappings[progId], status: 0 })
    })
  })

  // 3. DELETED: Soft-delete ALL mappings attached to this book for the current view
  deleted.forEach(d => {
    if (!d?.book_id) return

    const existingProgramIds: string[] = d.program_ids || []
    const programMappings: Record<string, string> = d.program_mappings || {}

    existingProgramIds.forEach(progId => {
      result.push({
        book_id: d.book_id,
        mapping_id: programMappings[progId],
        book_name: d.book_name,
        price: d.price,
        available_quantity: d.available_quantity,
        program_id: progId,
        segment_id: segment as string,
        medium_id: medium as string,
        isCommon: 0,
        status: 0, // Mark as deleted
        had_change: true
      })
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

export const getAggregatedBooks = (booksDetails: BooksListData[]) => {
  const map = new Map<string, any>()

  booksDetails.forEach((row: any) => {
    if (row.status === 0) return

    if (!map.has(row.book_id)) {
      map.set(row.book_id, {
        ...row,
        program_names: row.program ? [row.program] : [],
        program_ids: row.program_id ? [row.program_id] : [],
        program_mappings: row.program_id && row.mapping_id ? { [row.program_id]: row.mapping_id } : {}
      })
    } else {
      // Book exists, push new details and store the exact mapping_id for diffing later
      const existing = map.get(row.book_id)

      if (row.program && !existing.program_names.includes(row.program)) {
        existing.program_names.push(row.program)
      }

      if (row.program_id && !existing.program_ids.includes(row.program_id)) {
        existing.program_ids.push(row.program_id)
      }

      if (row.program_id && row.mapping_id) {
        existing.program_mappings[row.program_id] = row.mapping_id
      }
    }
  })

  return Array.from(map.values())
}
