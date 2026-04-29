import { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import { EditedDataTableOnSubmitPayload } from 'src/reusable_components/Table/ChaarvyDataTable'
import { CreateBookRequest } from 'src/store/services/adminServices'

const buildBooksPayload = (
  payload: EditedDataTableOnSubmitPayload,
  base: Partial<CreateBookRequest>
): CreateBookRequest[] => {
  const { created, updated, deleted } = payload

  const createdPayload = created
    .filter(c => c && !Object.values(c).some(v => v === undefined))
    .map(c => ({
      book_name: c.book_name ?? '',
      price: Number(c.price ?? 0),
      available_quantity: Number(c.available_quantity ?? 0),
      status: 1,
      ...base
    }))

  const updatedPayload = updated
    .filter(u => u?.book_id)
    .map(u => ({
      book_id: u.book_id,
      book_name: u.book_name ?? '',
      price: Number(u.price ?? 0),
      available_quantity: Number(u.available_quantity ?? 0),
      status: 1,
      had_change: true,
      ...base
    }))

  const deletedPayload = deleted
    .filter(d => d?.book_id)
    .map(d => ({
      book_id: d.book_id,
      book_name: d.book_name,
      price: d.price,
      available_quantity: d.available_quantity,
      status: 0,
      had_change: true,
      ...base
    }))

  return [...createdPayload, ...updatedPayload, ...deletedPayload]
}

export const generateSpecificBooksPayload = (
  payload: EditedDataTableOnSubmitPayload,
  filterData: CascadingSelectorState
): CreateBookRequest[] | undefined => {
  const { program, segment, medium } = filterData

  if (!(program && segment && medium)) return

  return buildBooksPayload(payload, {
    program_id: program,
    segment_id: segment,
    medium_id: medium
  })
}

export const generateCommonBooksPayload = (payload: EditedDataTableOnSubmitPayload): CreateBookRequest[] => {
  return buildBooksPayload(payload, {
    isCommon: 1
  })
}
