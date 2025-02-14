export type Book = {
  segment_id: string
  book_id: string
  book_name: string
  pages: number
}

export type BookDetails = {
  segment: string
  segment_id: string
  books: Book[]
}

export type Fees = {
  segment_id: string
  fees_type_id: string
  fees_type: string
  fees: number
}

export type FeesDetails = {
  segment: string
  segment_id: string
  fees: Fees[]
}

export type Program = {
  program_id: string
  program_name: string
  status?: number
}
